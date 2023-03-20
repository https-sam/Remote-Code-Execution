import * as child from "child_process";
import crypto from "crypto";
import fs from "fs";
import path from "path";
import {
	CodeContext,
	ContainerInitialization,
	JobStatus,
	WriteFileStatus,
	language,
	fileFormat,
	ExecuteContainer,
	Stdout,
} from "./types/worker";
import { containerCPULimit, containerMemLimit, mainClassName } from "./config";

class JobWorker {
	constructor() {}

	private _fileFormats: Record<language, fileFormat> = {
		python3: "py",
		javascript: "js",
	};

	/**
	 * Creates an appropriate docker container
	 * to execute the target code
	 */
	createContainer(language: language): Promise<ContainerInitialization> {
		return new Promise((resolve, reject) => {
			const initCommand = `docker create ${containerMemLimit} ${containerCPULimit} ${language}`;
			if (!(language in this._fileFormats)) {
				return reject({
					error: true,
					errorMessage: "Invalid container name.",
				});
			}

			child.exec(initCommand, (error, containerID, stderr) => {
				if (error) {
					reject({
						error: true,
						errorMessage: error.message,
					});
				} else if (stderr) {
					reject({
						error: true,
						errorMessage: stderr,
					});
				} else {
					resolve({
						error: false,
						containerID: containerID.trim(),
					});
				}
			});
		});
	}

	/**
	 * Returns a piece of code that executes the class method
	 * this is language specific, so defined using switch cases
	 */
	transformCodeIntoExecutable(language: language, context: CodeContext): string {
		switch(language) {
			case "python3": {
				return `\nprint(${mainClassName}().${context.functionName}())`
			}
			default: return ""
		}
	}

	/**
	 * writes a code into a temp file
	 */
	private async writeFile(
		language: language,
		context: CodeContext
	): Promise<WriteFileStatus> {
		return new Promise((resolve, reject) => {
			const fileName = crypto.randomBytes(32).toString("hex");
			const fileFormat = this._fileFormats[language];
			const filePath = path.join(
				__dirname,
				"..",
				"temp",
				`${fileName}.${fileFormat}`
			);

			// appending a line to execute a specific function
			context.code += this.transformCodeIntoExecutable(language, context)

			fs.writeFile(filePath, context.code, (error) => {
				if (error) {
					reject(error.message);
				} else {
					resolve({ filePath, fileFormat });
				}
			});
		});
	}

	/**
	 * Removes a container with the provided containerID
	 */
	async removeContainer(containerID: string): Promise<Stdout> {
		return new Promise((resolve, reject) => {
			const removeContainer = `docker rm --force ${containerID}`;
			child.exec(removeContainer, (error, stdout, stderr) => {
				if (error) {
					reject(error.message);
				} else if (stderr) {
					reject(stderr);
				} else {
					resolve(stdout);
				}
			});
		});
	}

	/**
	 * copies the target code into the newly created
	 * isolated container
	 */
	copyContext(
		containerID: string,
		language: language,
		context: CodeContext
	): Promise<string> {
		return new Promise(async (resolve, reject) => {
			this.writeFile(language, context)
				.then(({ filePath, fileFormat }) => {
					const initCommand = `docker cp ${filePath} ${containerID}:/src/target.${fileFormat}`;
					child.exec(initCommand, (error, containerID, stderr) => {
						if (error) {
							reject(error.message);
						} else if (stderr) {
							reject(stderr);
						} else {
							resolve(containerID.trim());
						}
					});
				})
				.catch((e) => {
					reject(e);
				});
		});
	}

	/**
	 *  Excecutes phase 1
	 *  1] Creates a new container
	 *  2] Copies the code into the contaienr
	 */
	initContainer(language: language, context: CodeContext): Promise<JobStatus> {
		return new Promise(async (resolve, reject) => {
			this.createContainer(language)
				.then(async ({ containerID, error, errorMessage }) => {
					if (error) return new Error(errorMessage);
					return this.copyContext(containerID, language, context)
						.then(() => {
							resolve({
								message: `Job has succedded.`,
								error: false,
								retryable: true,
								context: context,
								containerID: containerID,
							});
						})
						.catch((e) => {
							throw new Error(e);
						});
				})
				.catch((e) => {
					reject({
						message: `Job has failed for the following reason(s): ${e}.`,
						jobFailed: true,
						retryable: true,
						context: context,
					});
				});
		});
	}

	/**
	 * Executes phase 2
	 * 1] Spin up the container
	 * 2] Record the output from the container
	 */
	startContainer(language: language, context: CodeContext): Promise<ExecuteContainer> {
		return new Promise((resolve, reject) => {
			this.initContainer(language, context)
				.then((jobStatus: JobStatus) => {
					if (!jobStatus.error && jobStatus.containerID) {
						const startContainer = `docker start -a ${jobStatus.containerID}`;
						child.exec(startContainer, (error, stdout, stderr) => {
							if (error) {
								reject({
									error: true,
									errorMessage: error.message
								} as ExecuteContainer); 
							} else if (stderr) {
								reject({
									error: true,
									errorMessage: stderr
								} as ExecuteContainer);
							} else {
								resolve({
									error: false,
									codeOutput: stdout.trim(),
									containerID: jobStatus.containerID
								} as ExecuteContainer);
							}
						});
					} else {
						// job failed
						reject({
							error: true,
							errorMessage: `Job has failed in the process of initializing the container for the following reason(s): ${jobStatus.message}`
						} as ExecuteContainer); 
					}
				})
				.catch(_ => {});
		});
	}
}

export default JobWorker;

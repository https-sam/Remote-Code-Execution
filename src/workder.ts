import * as child from "child_process";
import crypto from "crypto";
import fs from "fs";
import path from "path";
import {
	ContainerInitialization,
	JobStatus,
	WriteFileStatus,
	container,
	fileFormat,
} from "./types/workder";

class JobWorker {
	constructor() {}

	private _fileFormats: Record<container, fileFormat> = {
		python3: "py",
		javascript: "js",
	};
	/**
	 * Creates an appropriate docker container
	 * to execute the target code
	 */
	createContainer(container: container): Promise<ContainerInitialization> {
		return new Promise((resolve, reject) => {
			const initCommand = `docker create ${container}`;

			child.exec(initCommand, (error, containerID, stderr) => {
				if (error) {
					reject(error.message);
				} else if (stderr) {
					reject(stderr);
				} else {
					resolve(containerID.trim());
				}
			});
		});
	}

	/**
	 * writes a code into a temp file
	 */

	async writeFile(
		container: container,
		context: string
	): Promise<WriteFileStatus> {
		return new Promise((resolve, reject) => {
			const fileName = crypto.randomBytes(32).toString("hex");
			const fileFormat = this._fileFormats[container];
			const filePath = path.join(
				__dirname,
				"..",
				"temp",
				`${fileName}.${fileFormat}`
			);

			fs.writeFile(filePath, context, (error) => {
				if (error) {
					reject(error.message);
				} else {
					resolve({ filePath, fileFormat });
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
		container: container,
		context: string
	): Promise<string> {
		return new Promise(async (resolve, reject) => {
			this.writeFile(container, context)
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
	initContainer(container: container, context: string): Promise<JobStatus> {
		return new Promise(async (resolve, reject) => {
			this.createContainer(container)
				.then(async (containerID) => {
					return this.copyContext(containerID, container, context)
						.then(() => {
							resolve({
								message: `Job has succedded.`,
								jobFailed: false,
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
	startContainer(container: container, context: string): Promise<string> {
		return new Promise((resolve, reject) => {
			this.initContainer(container, context)
				.then((jobStatus: JobStatus) => {
					if (!jobStatus.jobFailed && jobStatus.containerID) {
						const startContainer = `docker start -a ${jobStatus.containerID}`;
						child.exec(startContainer, (error, stdout, stderr) => {
							if (error) {
								reject(error.message);
							} else if (stderr) {
								reject(stderr);
							} else {
								resolve(stdout);
							}
						});
					} else {
						// job failed
						reject();
					}
				})
				.catch((e) => console.log(e));
		});
	}
}

export default JobWorker;

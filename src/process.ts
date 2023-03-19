import * as child from "child_process";
import crypto from "crypto";
import fs from "fs";
import path from "path";
import {
	ContainerInitialization,
	JobStatus,
	container,
	fileFormat,
} from "./types/process";

class Process {
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
					resolve(containerID);
				}
			});
		});
	}

	/**
	 * writes a code into a temp file
	 */
	async writeFile(container: container, context: string): Promise<string> {
		return new Promise((resolve, reject) => {
			const fileName = crypto.randomBytes(32).toString("hex");
			const filePath = path.join(
				__dirname,
				"..",
				"temp",
				`${fileName}.${this._fileFormats[container]}`
			);

			fs.writeFile(filePath, context, (error) => {
				if (error) {
					reject(error.message);
				} else {
					resolve(filePath);
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
				.then((filePath) => {
					const initCommand = `docker cp ${filePath} ${containerID}:/src`;
					console.log(filePath);
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
	 *  Excecutes phase1
	 *  1] Creates a new container
	 *  2] Copes the code into the contaienr
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
}

export default Process;

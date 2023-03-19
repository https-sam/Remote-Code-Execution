import * as child from "child_process";
import crypto from "crypto";
import fs from "fs";
import path from "path";
import {
	ContainerInitialization,
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
	async initContainer(container: container): Promise<ContainerInitialization> {
		return new Promise((reject, resolve) => {
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
	async prepTransfer(context: string, container: container): Promise<string> {
		return new Promise((reject, resolve) => {
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
	async copyContext(containerID: string): Promise<void> {
		return new Promise(async (reject, resolve) => {
			// const initCommand = `docker cp ${} ${containerID}/src`;
			// child.exec(initCommand, (error, containerID, stderr) => {
			// 	if (error) {
			// 		reject(error.message);
			// 	} else if (stderr) {
			// 		reject(stderr);
			// 	} else {
			// 		resolve(containerID);
			// 	}
			// });
		});
	}
}

export default Process;

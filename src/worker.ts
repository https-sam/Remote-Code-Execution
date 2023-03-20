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

const fileFormats: Record<language, fileFormat> = {
  python3: "py",
  javascript: "js",
};

class JobWorker {
  public language: language;
  public codeContext: CodeContext;
  public filename: string;
  public containerID: string;

  constructor(language: language, codeContext: CodeContext) {
    this.language = language;
    this.codeContext = codeContext;
    this.filename = "";
    this.containerID = "";
  }

  /**
   * Creates an appropriate docker container
   * to execute the target code
   */
  createContainer(): Promise<ContainerInitialization> {
    return new Promise((resolve, reject) => {
      if (!(this.language in fileFormats)) {
        reject({
          error: true,
          errorMessage: "Invalid language name.",
        });
      }
      
      const initCommand = `docker create ${containerMemLimit} ${containerCPULimit} ${this.language}`;
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
          this.containerID = containerID.trim();
          resolve({
            error: false,
            containerID: this.containerID,
          });
        }
      });
    });
  }

  /**
   * Returns a piece of code that executes the class method
   * this is language specific, so defined using switch cases
   */
  transformCodeIntoExecutable(): string {
    switch (this.language) {
      case "python3": {
        return `\nprint(${mainClassName}().${this.codeContext.functionName}())`;
      }
      default:
        return "";
    }
  }

  /**
   * writes a code into a temp file
   */
  private async writeFile(): Promise<WriteFileStatus> {
    return new Promise((resolve, reject) => {
      const fileFormat: string = fileFormats[this.language];
      this.filename = `${crypto.randomBytes(32).toString("hex")}.${fileFormat}`;
      const filePath = path.join(__dirname, "..", "temp", `${this.filename}`);

      // appending a line to execute a specific function
      this.codeContext.code += this.transformCodeIntoExecutable();

      fs.writeFile(filePath, this.codeContext.code, (error) => {
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
  copyContext(): Promise<string> {
    return new Promise(async (resolve, reject) => {
      if (!this.containerID) {
        reject("ContainerID not found.");
      }
      this.writeFile()
        .then(({ filePath, fileFormat }) => {
          const initCommand = `docker cp ${filePath} ${this.containerID}:/src/target.${fileFormat}`;
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
  initContainer(): Promise<JobStatus> {
    return new Promise(async (resolve, reject) => {
      this.createContainer()
      .then(() => {
          this.copyContext()
            .then(() => {
              resolve({
                message: `Job has succeeded.`,
                error: false,
                retryable: true,
              });
            })
            .catch((e) => {
              reject({
                message: e,
                error: true,
                retryable: true,
              });
            });
        })
        .catch(({errorMessage}) => {
          reject({
            message: errorMessage,
            error: true,
            retryable: true,
          });
        });
    });
  }

  /**
   * Executes phase 2
   * 1] Spin up the container
   * 2] Record the output from the container
   */
  async startContainer(): Promise<ExecuteContainer> {
    return new Promise((resolve, reject) => {
      this.initContainer()
        .then((jobStatus: JobStatus) => {
          if (!jobStatus.error && this.containerID) {
            const startContainer = `docker start -a ${this.containerID}`;
            child.exec(startContainer, (error, stdout, stderr) => {
              if (error) {
                reject({
                  error: true,
                  errorMessage: error.message,
                } as ExecuteContainer);
              } else if (stderr) {
                reject({
                  error: true,
                  errorMessage: stderr,
                } as ExecuteContainer);
              } else {
                resolve({
                  error: false,
                  codeOutput: stdout.trim(),
                } as ExecuteContainer);
              }
            });
          } else {
            // job failed
            reject({
              error: true,
              errorMessage: `Job has failed in the process of initializing the container for the following reason(s): ${jobStatus.message}`,
            } as ExecuteContainer);
          }
        })
        .catch((_) => {});
    });
  }

  /**
   * Removes a container with the provided containerID
   */
  async removeContainer(): Promise<Stdout> {
    return new Promise((resolve, reject) => {
      if (!this.containerID) {
        reject("ContainerID not found.");
      }
      
      const removeContainer = `docker rm --force ${this.containerID}`;
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
   * Deletes the temp file in /temp folder
   */
  async removeCacheFile(): Promise<Stdout> {
    return new Promise((resolve, reject) => {
      if (!this.filename) {
        return reject("Filename not found.");
      }
      const removeContainer = `rm  ${__dirname}/../temp/${this.filename}`;
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
   * Cleans up the job
   * Destroys the docker container & deletes cache files
   */
  async cleanupJob(): Promise<any> {
    const jobs: Promise<any>[] = [];
    jobs.push(this.removeContainer());
    jobs.push(this.removeCacheFile());
    return Promise.all(jobs);
  }
}

export default JobWorker;

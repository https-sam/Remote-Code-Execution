export type language = "python3" | "javascript";
export type fileFormat = "py" | "js";
export type Stdout = string

export interface CodeContext {
	/**
	 * raw string code to be excuted
	 */
	code: string

	/**
	 * A method name in class to be executed
	 */
	functionName: string
}

interface BaseError {
	/**
	 * Indicates an error during the process of spinning up the container
	 */
	error: boolean

	/**
	 * An error message in case the job fails
	 */
	errorMessage?: string
}

export interface ContainerInitialization extends BaseError {
	/**
	 * The ID of the newly created container
	 */
	containerID: string;
}

export interface WriteFileStatus {
	/**
	 * Newly created temp file that contain the context if exists
	 */
	filePath: string;


	/**
	 * The file format of the created file
	 */
	fileFormat: string;
}



export interface JobStatus extends BaseError{
	/**
	 * A brief message that describes that job status
	 */
	message: string;

	/**
	 * indicates if the job is retryable
	 */
	retryable: boolean;

	/**
	 * Newly created temp file that contain the context if exists
	 */
	filePath?: string;
}

export interface ExecuteContainer extends BaseError{
	/**
	 * stdout from the container as a result of running the code
	 */
	codeOutput?: Stdout

}
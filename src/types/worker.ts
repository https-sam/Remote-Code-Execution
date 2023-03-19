export type language = "python3" | "javascript";
export type fileFormat = "py" | "js";

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

export interface ContainerInitialization {
	/**
	 * Indicates whether it successfully created a contaienr
	 */
	error: boolean;

	/**
	 * The ID of the newly created container
	 */
	containerID: string;

	/**
	 * Error message in case of an error
	 */
	errorMessage?: string;
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

export interface JobStatus {
	/**
	 * A brief message that describes that job status
	 */
	message: string;

	/**
	 * Whether the job failed
	 */
	jobFailed: boolean;

	/**
	 * indicates if the job is retryable
	 */
	retryable: boolean;

	/**
	 * the raw data of the target code
	 */
	context: CodeContext;

	/**
	 * Newly created ontainer ID if exists
	 */
	containerID?: string;

	/**
	 * Newly created temp file that contain the context if exists
	 */
	filePath?: string;
}

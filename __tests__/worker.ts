import { ContainerInitialization } from "../src/types/worker";
import JobWorker from "../src/worker";

describe("Docker Initialization test", () => {
	const worker = new JobWorker();

	it("should create a python container", async () => {
		const jobStatus: ContainerInitialization = await worker.createContainer(
			"python3"
		);

		expect(jobStatus.error).toBe(false);
		expect(jobStatus.containerID).toBeTruthy;
		worker.removeContainer(jobStatus.containerID);
	});
});

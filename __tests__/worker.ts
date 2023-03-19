import { ContainerInitialization } from "../src/types/worker";
import JobWorker from "../src/worker";

describe("Docker initialization test", () => {
	const worker = new JobWorker();

	it("should create a python container", async () => {
		worker.createContainer("python3").then(({ error, containerID }) => {
			expect(error).toBe(false);
			expect(containerID).toBeTruthy;
			worker.removeContainer(containerID);
		});
	});

	it("should not create a container", async () => {
		worker
			.createContainer("invalidName" as any)
			.catch(
				({ error, containerID, errorMessage }: ContainerInitialization) => {
					expect(error).toBe(true);
					expect(containerID).toBeFalsy;
					expect(errorMessage).toBeTruthy;
				}
			);
	});
});

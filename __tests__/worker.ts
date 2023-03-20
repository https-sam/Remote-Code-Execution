import { ContainerInitialization } from "../src/types/worker";
import JobWorker from "../src/worker";


describe("Docker initialization test", () => {
	
	it("should create a python container", async () => {
		const worker = new JobWorker("python3", {code: "", functionName: ""});
		worker.createContainer().then(({ error, containerID }) => {
			expect(error).toBe(false);
			expect(containerID).toBeTruthy;
			worker.removeContainer();
		}).catch(_ => {})
	});
	
	it("should not create a container", async () => {
		const worker = new JobWorker("invalidName" as any, {code: "", functionName: ""});
		worker
			.createContainer()
			.catch(
				({ error, containerID, errorMessage }: ContainerInitialization) => {
					expect(error).toBe(true);
					expect(containerID).toBeFalsy();
					expect(errorMessage).toBeTruthy();
				}
			);
	});
});



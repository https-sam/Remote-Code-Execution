import { ContainerInitialization } from "../src/types/worker";
import JobWorker from "../src/worker";
import fs from 'fs'

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
					expect(containerID).toBeFalsy();
					expect(errorMessage).toBeTruthy();
				}
			);
	});
});


describe("Python code excution test", () => {
  const worker = new JobWorker();
  
  it('should calculate a frequency in string', () => {
      fs.readFile(`${__dirname}/test-code/python/counter.py`, 'utf8', (_, code) => {
        worker
      .startContainer("python3", code)
      .then((output) => {
        expect(output).toBe("Counter({'a': 2, 's': 2, 'w': 2, 'e': 2, 'l': 1, 'd': 1, 'k': 1})")
      })
      .catch((e) => console.log(e));
    });
  })
})
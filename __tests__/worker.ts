import { ContainerInitialization } from "../src/types/worker";
import JobWorker from "../src/worker";

describe("Docker initialization test", () => {
  it("should create a python container", async () => {
    const worker = new JobWorker("python3", { code: "", functionName: "" });
    worker
      .createContainer()
      .then(({ error, containerID }) => {
        expect(error).toBe(false);
        expect(containerID).toBeTruthy;
        worker.removeContainer();
      })
      .catch((_) => {});
  });

  // TODO write a tast case for writeFile() & copyContext

  it("should not create a container", async () => {
    const worker = new JobWorker("invalidName" as any, {
      code: "",
      functionName: "",
    });
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


  it("should not initialize a container", async () => {
    const worker = new JobWorker("invalidName" as any, { code: "print('Hello World!')", functionName: "" });
    worker
      .initContainer()
      .then(({ error, message }) => {
        expect(error).toBe(false);
        expect(message).toBe("Job has succedded.");
        worker.cleanupJob();
      })
      .catch((_) => {});
  });

  it("should initialize a python container with code in it", async () => {
    const worker = new JobWorker("python3", { code: "print('Hello World!')", functionName: "" });
    worker
      .initContainer()
      .then(({ error, message }) => {
        expect(error).toBe(false);
        expect(message).toBe("Job has succedded.");
        worker.cleanupJob();
      })
      .catch((_) => {});
  });
});

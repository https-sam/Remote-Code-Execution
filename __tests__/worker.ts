import JobWorker from "../src/worker";

describe("Docker initialization test", () => {
  it("should create a python container", async () => {
    const worker = new JobWorker("python3", { code: "", functionName: "" });
    const { error, containerID } = await worker.createContainer()
    expect(error).toBe(false);
    expect(containerID).toBeTruthy;
    await worker.removeContainer();
  });

  // TODO write a tast case for writeFile() & copyContext

  it("should not create a container", async () => {
    const worker = new JobWorker("invalidName" as any, { code: "", functionName: ""});
    expect.assertions(3);
    try {
      await worker.createContainer()
    } catch ({ error, containerID, errorMessage }: any) {
      expect(error).toBe(true);
      expect(containerID).toBeFalsy();
      expect(errorMessage).toBe("Invalid language name.");
    }
  });


  it("should not initialize a container", async () => {
    const worker = new JobWorker("invalidName" as any, { code: "print('Hello World!')", functionName: "" });
    expect.assertions(2);
    try {
      await worker.initContainer()
    } catch ({ error, message }: any) {
      expect(error).toEqual(true)
      expect(message).toEqual("Invalid language name.")
    }
  });

  it("should initialize a python container with code in it", async () => {
    const worker = new JobWorker("python3", { code: "print('Hello World!')", functionName: "" });
    const { error, message } = await worker.initContainer()
    expect(error).toBe(false)
    expect(message).toBe("Job has succeeded.");
    worker.cleanupJob();
  });
});

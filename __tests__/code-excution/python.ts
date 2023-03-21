import { mainClassName } from "../../src/config";
import { CodeContext } from "../../src/types/worker";
import JobWorker from "../../src/worker";
import fs from 'fs'

describe("Python transform into executable", () => {
  const functionName = "solution"
  const worker = new JobWorker("python3", {code: "", functionName: functionName});
   it('should instantiate an object and execute the function', () => {
    const codeContext = worker.transformCodeIntoExecutable()
    expect(codeContext).toBe(`\nprint(${mainClassName}().${functionName}())`)
   })
})


describe("Python code excution test", () => {
  let fileJobs: Promise<any>[] = []
  let codes: string[]
  fileJobs.push(fs.promises.readFile(`${__dirname}/../test-code/python/counter.py`))
  fileJobs.push(fs.promises.readFile(`${__dirname}/../test-code/python/helloWorld.py`))
  beforeAll((done) => {
    Promise.all(fileJobs)
    .then(outputs => {
      codes = outputs
      done()
    })
  })
  it('should calculate a frequency in string', async () => {
    const codeContext: CodeContext = {
      code: codes[0],
      functionName: "calculate"
    }
    const worker = new JobWorker("python3", codeContext);
    const response = await worker.startContainer()
    expect(response.codeOutput).toBe("Counter({'a': 2, 's': 2, 'w': 2, 'e': 2, 'l': 1, 'd': 1, 'k': 1})")
    await worker.cleanupJob();
  })
  it('should return string "Hello World"', async () => {
    const codeContext: CodeContext = {
      code: codes[1],
      functionName: "run"
    }
    const worker = new JobWorker("python3", codeContext);
    const response = await worker.startContainer()
    expect(response.codeOutput).toBe("Hello World!")
    await worker.cleanupJob();
  });
})
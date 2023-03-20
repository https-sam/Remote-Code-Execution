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
  let code: string
  beforeAll((done) => {
    fs.readFile(`${__dirname}/../test-code/python/counter.py`, 'utf8', (err, data) => {
      code = data
      done()
    })
  })
  it('should calculate a frequency in string', async () => {
    const codeContext: CodeContext = {
      code: code,
      functionName: "calculate"
    }
    const worker = new JobWorker("python3", codeContext);
    const response = await worker.startContainer()
    expect(response.codeOutput).toBe("Counter({'a': 2, 's': 2, 'w': 2, 'e': 2, 'l': 1, 'd': 1, 'k': 1})")
    await worker.cleanupJob();
  })
})
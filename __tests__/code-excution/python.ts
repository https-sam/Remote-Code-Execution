import { mainClassName } from "../../src/config";
import { CodeContext, ExecuteContainer } from "../../src/types/worker";
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


// TODO needs some work, cannot seem to ready file here, and is being recognized as success

// describe("Python code excution test", () => {
//   it('should calculate a frequency in string', () => {
//     expect.assertions(1);

//     fs.readFile(`${__dirname}/../test-code/python/counter.py`, 'utf8', async (error, code) => {
//       const codeContext: CodeContext = {
//         code: code,
//         functionName: "calculate"
//       }
//       const worker = new JobWorker("python3", codeContext);
//       const response = await worker.startContainer()
//       console.log(response)
//       expect(response.codeOutput).toBe("Counter({'a': 2, 's': 2, 'w': 2, 'e': 2, 'l': 1, 'd': 1, 'k': 1})")
//       await worker.cleanupJob();
//     });
//   })
// })
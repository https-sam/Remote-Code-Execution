import { mainClassName } from "../../src/config";
import { CodeContext, ExecuteContainer } from "../../src/types/worker";
import JobWorker from "../../src/worker";
import fs from 'fs'

describe("Python transform into executable", () => {
  const worker = new JobWorker();
   it('should instantiate an object and execute the function', () => {
    const functionName = "solution"
    const codeContext = worker.transformCodeIntoExecutable("python3", {
      code: "",
      functionName: functionName
    })
    expect(codeContext).toBe(`\nprint(${mainClassName}().${functionName}())`)
   })
})


// describe("Python code excution test", () => {
//   const worker = new JobWorker();
  
//   it('should calculate a frequency in string', () => {
//     fs.readFile(`${__dirname}/../test-code/python/counter.py`, 'utf8', (_, code) => {
//       const codeContext: CodeContext = {
//         code: code,
//         functionName: "calculate"
//       }
//       worker
//       .startContainer("python3", codeContext)
//       .then((response: ExecuteContainer) => {
//         expect(response.codeOutput).toBe("Counter({'a': 2, 's': 2, 'w': 2, 'e': 2, 'l': 1, 'd': 1, 'k': 1})")
//         worker.removeContainer(response.containerID!);
//       })
//       .catch(_ => {});
//     });
//   })
// })
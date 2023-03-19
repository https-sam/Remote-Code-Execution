import { CodeContext } from "../../src/types/worker";
import JobWorker from "../../src/worker";
import fs from 'fs'


describe("Python code excution test", () => {
  const worker = new JobWorker();
  
  it('should calculate a frequency in string', () => {
    fs.readFile(`${__dirname}/../test-code/python/counter.py`, 'utf8', (_, code) => {
      const codeContext: CodeContext = {
        code: code,
        functionName: "calculate"
      }
      worker
      .startContainer("python3", codeContext)
      .then((output) => {
        expect(output).toBe("Counter({'a': 2, 's': 2, 'w': 2, 'e': 2, 'l': 1, 'd': 1, 'k': 1})")
      })
      .catch((e) => console.log(e));
    });
  })
})
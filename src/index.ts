import { CodeContext } from "./types/worker";
import JobWorker from "./worker";
import fs from "fs"

fs.readFile(`${__dirname}/../__tests__/test-code/python/counter.py`, 'utf8', (err, data) => {
  const codeContext: CodeContext = {
    code: data,
    functionName: "calculate"
  }
  const worker = new JobWorker("python3", codeContext);
  worker.startContainer()
  .then((output) => {
    console.log(output) 
  }).catch(e => {
    console.log(e)
  })
})

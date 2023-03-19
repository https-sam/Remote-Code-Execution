import JobWorker from "./worker";

const worker = new JobWorker();
worker
	.startContainer("python3", "print(10+898786)")
	.then((output) => console.log(output))
	.catch((e) => console.log(e));

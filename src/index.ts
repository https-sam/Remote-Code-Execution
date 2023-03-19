import JobWorker from "./workder";

const workder = new JobWorker();
workder
	.startContainer("python3", "print(10+898786)")
	.then((output) => console.log(output))
	.catch((e) => console.log(e));

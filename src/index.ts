import Process from "./process";

const process = new Process();
process
	.prepTransfer("print('Hi')", "python3")
	.then((containerID) => console.log(containerID))
	.catch((e) => console.log(e));
// process
// 	.initContainer("python3")
// 	.then((containerID) => console.log(containerID))
// 	.catch((e) => console.log(e));

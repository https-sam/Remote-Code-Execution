import Process from "./process";

const process = new Process();
process
	.initContainer("python3", "print('Hi')")
	.then(() => console.log("OK"))
	.catch((e) => console.log(e));

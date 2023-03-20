# Remote Code Execution Server
These days, pletforms like leetcode, algoexpert, etc have been increasingly becoming popular, so I thought I'd design and implement an environment that  safely executes code sent by the user, while providing security measures. 

# Sandboxed Environments
Since it executes ANY code sent by the user, it must ensure that it won't affect the system or the other processes that are running other user's code.  
Possible edge cases
- Executing malicious code 
- Infinite loops
- Recursion without a base case
- Memory / CPU intensive jobs

To handle this, the server creates an isolated unique docker container to executes the code inside the container, allowing to isolate any disaster and limit memory usage or CPU usage. 

# Remote Code Execution Server
A server that safely executes code sent by the user. 

# Sandboxed Environments
Since it executes ANY code sent by the user, it must ensure that it won't affect the system or the other processes that are running other user's code.  
Possible edge cases
- Executing malicious code 
- Infinite loops
- Recursion without a base case
- Memory / CPU intensive jobs

To handle this, the server creates an isolated unique docker container for code sent by the user and executes the code inside the container, allowing to isolate any desaster and limit memory usage or CPU usage. 

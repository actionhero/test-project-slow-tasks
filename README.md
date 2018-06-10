# A Test actionhero project to explore rebooting while a task is running
*related to https://github.com/actionhero/actionhero/issues/1225*

This project has a few recurring tasks (slow, medium, and fast).  The stuckWorkerTimeout is set to be only 10 seconds.  There are (up to) 5 taskProcessors running and the task/resque scheduler.  100 "medium" tasks cab be launched with the `taskSpawn` action: `curl localhost:8080/api/taskSpawn`

At any moment, it will be likely at least one task is running.  

## Running
1. be sure to clear your redis when starting a test `redis-cli flushall`
2. run with a slower shutdown timeout `ACTIONHERO_SHUTDOWN_TIMEOUT=10000 npm start`

... for the lazy `redis-cli flushall && ACTIONHERO_SHUTDOWN_TIMEOUT=10000 npm start`


## Ending
End your actionhero server with ctrl-c or USR2, and you will see this error after 10s

```
/Users/evan/PROJECTS/actionhero/test-project-slow-tasks/node_modules/actionhero/bin/methods/start.js:72
      throw new Error('process stop timeout reached.  terminating now.')
      ^

Error: process stop timeout reached.  terminating now.
    at Timeout.setTimeout [as _onTimeout] (/Users/evan/PROJECTS/actionhero/test-project-slow-tasks/node_modules/actionhero/bin/methods/start.js:72:13)
    at ontimeout (timers.js:466:11)
    at tryOnTimeout (timers.js:304:5)
    at Timer.listOnTimeout (timers.js:267:5)
  ```

  This shows that there is now a "stuck" job in redis.
  You can inspect this with the redis-cli:

  ```
  > redis-cli
127.0.0.1:6379> keys *

...
13) "resque:worker:evantop.local:25478+1:default"
...

127.0.0.1:6379> get resque:worker:evantop.local:25478+1:default

"{\"run_at\":\"Sun Jun 10 2018 13:30:07 GMT-0700 (PDT)\",\"queue\":\"default\",\"payload\":{\"class\":\"slow-task\",\"queue\":\"default\",\"args\":[{}]},\"worker\":\"evantop.local:25478+1\"}"
```

Here we can see the worker `evantop.local:25478+1` was killed off without properly exiting, as there is the data about what it was working on (slow-task in this case).

## Restarting
0. wait 11 seconds for stuckWorkerTimeout to pass.
1. start your actionhero process back up, without clearing redis, ie: `ACTIONHERO_SHUTDOWN_TIMEOUT=10000 npm start`.
2. we can see that within a few seconds, when this process gets the lock to be the scheduler, it will clean the old worker, and move the job it was working on to the failed queue

```
192.168.7.25 @ 2018-06-10T21:42:30.685Z - warning: cleaned stuck worker workerName=evantop.local:35226+1, worker=evantop.local:35226+1, queue=default, class=slow-task, queue=default, args=[], exception=Worker Timeout (killed manually), error=Worker Timeout (killed manually), backtrace=[killed by evantop.local at Sun Jun 10 2018 14:42:30 GMT-0700 (PDT), queue#forceCleanWorker, node-resque], failed_at=Sun Jun 10 2018 14:42:30 GMT-0700 (PDT), delta=43
```

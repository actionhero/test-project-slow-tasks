# A Test actionhero project to explore rebooting while a task is running
*related to https://github.com/actionhero/actionhero/issues/1225*

This project has a few recurring tasks (slow, medium, and fast).  The stuckWorkerTimeout is set to be only 1 minute.  There are 5 taskProcessors running and the task/resque scheduler.  100 "medium" tasks cab be launched with the `taskSpawn` action: `curl localhost:8080/api/taskSpawn`

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

1) "resque:worker:evan.local:11450+2:default:started"
2) "resque:worker:ping:evan.local:11450+1"
3) "resque:connection_test_key"
4) "resque:delayed:1528512041"
5) "resque:stat:processed:evan.local:11450+1"
6) "resque:worker:ping:evan.local:11450+4"
7) "resque:workers"
8) "resque:timestamps:{\"class\":\"fast-task\",\"queue\":\"default\",\"args\":[{}]}"
9) "resque:delayed_queue_schedule"
10) "resque:timestamps:{\"class\":\"medium-task\",\"queue\":\"default\",\"args\":[{}]}"
11) "resque:stat:processed"
12) "resque:stat:processed:evan.local:11450+2"
13) "resque:worker:ping:evan.local:11450+2"
14) "resque:workerslock:slow-task:default:[{}]"
15) "resque:worker:evan.local:11450+3:default:started"
16) "resque:worker:evan.local:11450+4:default:started"
17) "resque:delayed:1528512046"
18) "resque:worker:evan.local:11450+1:default:started"
19) "resque:queues"
20) "resque:worker:evan.local:11450+1:default"
21) "resque:worker:ping:evan.local:11450+3"
```

Here we can see the worker `resque:worker:evan.local:11450` was killed off without properly exiting, as there is the data about what it was working on.  

## Restarting
0. wait 1 minute for stuckWorkerTimeout to pass.
1. start your actionhero process back up, without clearing redis.

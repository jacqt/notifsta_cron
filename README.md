# notifsta_cron
Schedule jobs using node-cron

Everything is hard coded, and the structure in which the data should be hard coded should be clear.

Best way to run this and have it survive after the ssh session ends will probably be 
```
nohup node app.js &
```

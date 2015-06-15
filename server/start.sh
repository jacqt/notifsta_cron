#!/bin/bash
rm nohup.out
nohup node notifsta_cron_backend &
echo $! > proc_pid

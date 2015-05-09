#!/bin/bash
rm nohup.out
nohup node app &
echo $! > proc_pid

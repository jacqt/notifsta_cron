#!/bin/bash
pid=$(cat "./proc_pid")
echo killing $pid
kill $pid

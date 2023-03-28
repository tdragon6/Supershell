#!/bin/bash
cd /app/bin
exec /app/wait-for-it.sh -t 0 flask:5000 -- ./server --datadir /data --webserver :3232

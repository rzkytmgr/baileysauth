#!/bin/bash

set -e && reset

echo "⚡ Automatically testing using docker compose"
docker compose up --abort-on-container-exit --build app
docker compose down --volumes --remove-orphans > /dev/null 2>&1
echo "⚡ Testing finished"
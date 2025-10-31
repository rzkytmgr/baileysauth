#!/bin/bash

set -e && reset


if command -v docker >/dev/null 2>&1 && command -v docker compose >/dev/null 2>&1; then
    echo "⚡ Automatically testing using docker compose"
    docker compose up --abort-on-container-exit --build app
    docker compose down --volumes --remove-orphans > /dev/null 2>&1
    echo "⚡ Testing finished"
else
    echo "docker or docker compose is not installed on this device,"
    echo "testing will be done in the cloud."
fi
#!/bin/bash
set -euo pipefail

key="${DEPLOY_KEY:-$HOME/.ssh/carson.aws.pem}"
hostname="${DEPLOY_HOST:-theredbuttongame.click}"
service="${DEPLOY_SERVICE:-startup}"

printf "\nUsing startup deploy defaults (override with DEPLOY_KEY, DEPLOY_HOST, DEPLOY_SERVICE).\n"
./deployService.sh -k "$key" -h "$hostname" -s "$service"

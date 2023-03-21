#!/bin/sh
DIR="$( cd "$( dirname "$0" )" && pwd )"

# build docker python environment
docker build -t python3 -f $DIR/dockerfiles/python3.Dockerfile .
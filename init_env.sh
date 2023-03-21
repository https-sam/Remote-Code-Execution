#!/bin/sh

DIR="$( cd "$( dirname "$0" )" && pwd )"

# build python docker environment
docker build -t python3 -f $DIR/dockerfiles/python3.Dockerfile .

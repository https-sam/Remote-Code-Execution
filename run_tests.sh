#!/bin/sh
docker build -t python3 -f /src/dockerfiles/python3.Dockerfile . && jest

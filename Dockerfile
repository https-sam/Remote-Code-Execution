FROM node:alpine

COPY . /src

WORKDIR /src

RUN apk update && apk add --no-cache docker-cli

RUN npm install && npm i jest -g

RUN docker build -t python3 -f /src/dockerfiles/python3.Dockerfile .

ENTRYPOINT [ "./run_tests.sh" ]
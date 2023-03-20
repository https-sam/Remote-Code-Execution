FROM node:alpine

COPY . /src

WORKDIR /src

RUN apk update && apk add --no-cache docker-cli

RUN npm install && npm i jest -g

ENTRYPOINT [ "/run_tests.sh" ]
FROM node:alpine

WORKDIR /api
COPY . /api

RUN yarn install

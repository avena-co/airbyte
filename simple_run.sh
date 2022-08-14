#!/bin/bash

export VERSION=v0.39.29-alpha

./gradlew :airbyte-webapp:assemble
./gradlew :airbyte-server:assemble

docker-compose up

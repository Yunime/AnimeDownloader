#!/bin/bash

docker build --tag yunime/animedownloader:latest .

#docker buildx build --platform linux/arm/v7 --tag yunime/animedownloader:latest .

docker save --output animedownloader.tar yunime/animedownloader:latest
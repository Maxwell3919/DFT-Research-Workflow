FROM ubuntu:24.04

ENV DEBIAN_FRONTEND=noninteractive
RUN apt-get update \
    && apt-get install -y --no-install-recommends \
       imagemagick \
       mesa-utils \
       openbox \
       scrot \
       x11-apps \
       x11-utils \
       xauth \
       xdotool \
       xvfb \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /case

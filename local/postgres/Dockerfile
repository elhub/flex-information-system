FROM postgres:15.6-bookworm

LABEL maintainer="Team Flex"

RUN apt-get update \
      && apt-get install -y --no-install-recommends \
          pgtap \
          postgresql-15-pgtap \
          postgresql-15-wal2json \
      && rm -rf /var/lib/apt/lists/*

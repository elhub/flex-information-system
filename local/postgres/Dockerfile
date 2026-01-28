FROM postgres:16.11-trixie

RUN apt-get update \
      && apt-get install -y --no-install-recommends \
          pgtap \
          postgresql-16-pgtap \
          postgresql-16-wal2json \
          postgresql-16-cron \
      && rm -rf /var/lib/apt/lists/*

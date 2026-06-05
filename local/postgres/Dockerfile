FROM postgres:17.9-trixie

RUN apt-get update \
      && apt-get install -y --no-install-recommends \
          pgtap \
          postgresql-17-pgtap \
          postgresql-17-postgis-3 \
          postgresql-17-wal2json \
          postgresql-17-cron \
          postgresql-17-postgis-3 \
      && rm -rf /var/lib/apt/lists/*

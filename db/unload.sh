#!/usr/bin/env bash
# Empty data from the database by dropping a few schemas
set -euxo pipefail

# check if PGHOST is set
if [ -z "${PGHOST}" ]; then
	echo "PGHOST is not set"
	exit 1
fi

for schema in flex api auth utils; do
	psql -X -v ON_ERROR_STOP=1 -d flex -U postgres \
		-c "DROP SCHEMA IF EXISTS ${schema} CASCADE;"
done

psql -X -v ON_ERROR_STOP=1 -d flex -U postgres \
	-c "CREATE SCHEMA flex AUTHORIZATION flex;"

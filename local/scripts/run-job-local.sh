#!/usr/bin/env bash
# Runs a kbackend job on the host against the local docker environment
# (database + local adapter mock on port 5001, see local/adapter).
#
# Usage: local/scripts/run-job-local.sh [job-name] [finalise]
# Example: local/scripts/run-job-local.sh sync-metering-grid-area-data false
set -euo pipefail

cd "$(git rev-parse --show-toplevel)/kbackend"

JOB="${1}"
FINALISE="${2:-false}"

DB_USERNAME="${FLEX_DATABASE_USERNAME:-flex_staging_structure_data}"
DB_PASSWORD="${FLEX_DATABASE_PASSWORD:-staging_structure_data_password}"

JOB="$JOB" \
	FLEX_DATABASE_URL="${FLEX_DATABASE_URL:-jdbc:postgresql://localhost:5432/flex}" \
	FLEX_DATABASE_USERNAME="$DB_USERNAME" \
	FLEX_DATABASE_PASSWORD="$DB_PASSWORD" \
	NOTICE_MAIL_DB_USERNAME="${NOTICE_MAIL_DB_USERNAME:-$DB_USERNAME}" \
	NOTICE_MAIL_DB_PASSWORD="${NOTICE_MAIL_DB_PASSWORD:-$DB_PASSWORD}" \
	ADAPTER_BASE_URL="${ADAPTER_BASE_URL:-http://localhost:5001}" \
	ADAPTER_API_KEY="${ADAPTER_API_KEY:-key}" \
	SYNC_METERING_GRID_AREA_DATA_FINALISE="$FINALISE" \
	SYNC_GRID_MODEL_DATA_FINALISE="$FINALISE" \
	SYNC_PARTY_DATA_FINALISE="$FINALISE" \
	./gradlew run

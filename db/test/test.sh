#!/usr/bin/env bash
set -euo pipefail

function showHelp() {
	cat <<EOF
Usage: ./test.sh <extension> [--no-teardown] [-h|--help]
    Execute tests for a database extension using pgTAP in Docker.

Options:
    --no-teardown: Skip teardown
                   This will speed up the next test run since
                   we don't have to start/stop the database

    -h, --help:    Show this help message and exit
EOF
}

options=$(getopt -l "help,no-teardown" -o "h" -- "$@")
eval set -- "$options"
no_teardown=0
while true; do
	case "$1" in
	--no-teardown)
		no_teardown=1
		shift
		;;
	-h | --help)
		showHelp
		exit 0
		;;
	--)
		shift
		break
		;;
	esac
done

if [ "$#" -ne 1 ]; then
	showHelp
	exit 1
fi
extension="$1"

# go to where the script is located
cd "$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" &>/dev/null && pwd)"

function setup() {
	docker compose \
		--project-name dbtest up \
		--detach \
		--wait
}

function teardown() {
	if [ "$no_teardown" = "1" ]; then
		echo "Skipping teardown"
	else
		echo "Tearing down docker container"
		echo "NOTE: To avoid teardown use the --no-teardown flag."
		echo "      This will speed up the next test run."
		docker compose down || true
	fi
}

function run() {
	echo "# Executing:" "$@"
	echo ""
	docker compose exec dbtest bash -c "$@"
	echo ""
}

# Start MAIN
teardown

setup

run "pg_prove -U postgres /db/$extension/test/ --ext .sql  --verbose --failures"

teardown

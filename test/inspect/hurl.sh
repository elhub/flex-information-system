#!/usr/bin/env bash
# Just a wrapper for hurl to remember the commands to run
# Usage ./hurl.sh <envfile> <hurlfile>
set -euxo pipefail

SCRIPT_DIR=$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" &>/dev/null && pwd)

# Using Test Suite keypair
PRIVATE_KEY_FILE="${SCRIPT_DIR}/../keys/.test.key.pem"

# HURL_ variables can be used in the hurl file
HURL_grant_jwt=$("$SCRIPT_DIR/gen_jwt.py" "$PRIVATE_KEY_FILE")
export HURL_grant_jwt

hurl \
	--variables-file "$1" \
	--very-verbose \
	--color \
	"$2" | jq

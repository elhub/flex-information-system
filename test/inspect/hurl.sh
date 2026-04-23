#!/usr/bin/env bash
# Just a wrapper for hurl to remember the commands to run
# Usage ./hurl.sh <envfile> <hurlfile>
set -euxo pipefail

SCRIPT_DIR=$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" &>/dev/null && pwd)

VARIABLES_FILE="$1"
AUDIENCE=$(grep -E '^auth_url=' "$VARIABLES_FILE" | cut -d= -f2-)
echo "Audience: $AUDIENCE"

# Using Test Suite keypair
PRIVATE_KEY_FILE="${SCRIPT_DIR}/../keys/.test.key.pem"

# HURL_ variables can be used in the hurl file
HURL_grant_jwt=$("$SCRIPT_DIR/../../.venv/bin/python3" "$SCRIPT_DIR/gen_jwt.py" "$PRIVATE_KEY_FILE" "$AUDIENCE/")
export HURL_grant_jwt

HURL_today=$(date +%Y-%m-%d)
export HURL_today

hurl -k \
	--variables-file "$1" \
	--very-verbose \
	--color \
	"$2" | jq

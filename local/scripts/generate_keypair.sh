#!/usr/bin/env bash
# Generate a keypair if it doesn't exist
# Usage ./generate_keypair.sh <dir> <name>
set -euo pipefail

KEY_DIR="$1"
KEY_NAME="$2"

mkdir -p "$KEY_DIR"

PRIVATE_KEY_FILE="${KEY_DIR}/.${KEY_NAME}.key.pem"
if [ ! -f "$PRIVATE_KEY_FILE" ]; then
	echo "Generating private key"
	openssl genrsa 3072 >"$PRIVATE_KEY_FILE"
fi

PUBLIC_KEY_FILE="${KEY_DIR}/.${KEY_NAME}.pub.pem"
if [ ! -f "$PUBLIC_KEY_FILE" ]; then
	echo "Generating public key"
	openssl rsa -in "$PRIVATE_KEY_FILE" -pubout -out "$PUBLIC_KEY_FILE"
fi

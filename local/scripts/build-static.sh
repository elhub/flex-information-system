#!/usr/bin/env bash
set -euxo pipefail

# ensure that we are in the root of the repository
cd "$(git rev-parse --show-toplevel)"
rm -rf dist/*
mkdir -p dist

# Print usage information
function usage() {
	echo "Usage: $0 <environment short name>"
	echo "Environment short name can be one of: dev, local, prod, staging, test"
	echo "If the environment name is not one of these, then the short name will be used as the long name."
	exit 1
}

# env_long_name allows you to get a long name from a short env name
# to get the long name from the short name
declare -A env_map
env_map=(
	["dev"]="development"
	# Local is a reserved name in Vite
	# It cannot be used as a mode name because it conflicts with the .local postfix for .env files.
	# https://vitejs.dev/guide/env-and-mode
	# Resolving that by using "local-dev" instead of "local"
	["local"]="local-dev"
	["prod"]="production"
	["staging"]="staging"
	["test"]="testing"
)

env_long_name() {
	local env_short_name=$1
	if [[ -n ${env_map[$env_short_name]:-} ]]; then
		echo "${env_map[$env_short_name]}"
	else
		echo "$env_short_name"
	fi
}

# build frontend
function frontend() {
	local env_short=$1
	local env_long=$2
	cd frontend
	npm install
	npm run build -- --base / --mode "$env_long"
	mv dist/* ../dist/
	cd ..
}

# script start
env_short=$1
if [ -z "$env_short" ]; then
	usage
fi

env_long=$(env_long_name "$env_short")

echo "Building for $env_long ($env_short) environment"

# build
frontend "$env_short" "$env_long"

# package
cd dist
tar -czf dist.tar.gz ./*

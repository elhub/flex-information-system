#!/usr/bin/env bash
set -euo pipefail

# This script generates an OpenAPI client for a given external service, using
# the Fabrikt OpenAPI generator. An openapi.yaml file must be present in the
# output service's directory, and the generated client will be placed in the
# same directory under a `generated` subpackage.

if [ $# -ne 1 ]; then
	echo "Usage: $0 <service>"
	exit 1
fi

service=$1
topdir="$(git rev-parse --show-toplevel)"

docker run --rm --user "$(id -u):$(id -g)" -v "$topdir":/workspace ghcr.io/fabrikt-io/fabrikt:latest \
	--output-directory 'kbackend' \
	--base-package "no.elhub.flex.integration.$service.generated" \
	--api-file "kbackend/src/main/kotlin/no/elhub/flex/integration/${service//.//}/openapi.yaml" \
	--http-client-target 'ktor' \
	--serialization-library 'kotlinx_serialization' \
	--instant-library 'kotlin_time_instant' \
	--validation-library 'no_validation' \
	--targets 'client'

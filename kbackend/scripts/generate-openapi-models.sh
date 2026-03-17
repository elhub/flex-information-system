#!/usr/bin/env bash
set -euo pipefail

# This script generates Kotlin models (types) for the adapter, using the
# Fabrikt OpenAPI generator. An openapi.yaml file must be present in the
# output types' directory, and the generated code will be placed in the
# same directory under a `generated` subpackage.

topdir="$(git rev-parse --show-toplevel)"

docker run --rm --user "$(id -u):$(id -g)" -v "$topdir":/workspace ghcr.io/fabrikt-io/fabrikt:latest \
	--output-directory 'kbackend' \
	--base-package "no.elhub.flex.model.dto.generated" \
	--api-file "kbackend/openapi.yaml" \
	--serialization-library 'kotlinx_serialization' \
	--instant-library 'kotlin_time_instant' \
	--validation-library 'no_validation' \
	--targets 'http_models'

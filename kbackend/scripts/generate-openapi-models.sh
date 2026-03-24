#!/usr/bin/env bash
set -euo pipefail

# This script generates API models using the Fabrikt OpenAPI generator.
#
# The source spec (backend/data/static/openapi.json) uses OpenAPI 3.1.0 features
# that the Kaizen parser (used by Fabrikt) does not support. A preprocessed copy
# is written to a temp file with the following transformations applied:
#   - openapi version downgraded to 3.0.1
#   - jsonSchemaDialect removed
#   - type: ["string", "null"] replaced with type: string + nullable: true
#   - links removed from all responses (Kaizen LinkValidator NPE bug)
#   - type removed from any object that also has a $ref sibling (in OAS 3.0,
#     $ref replaces all siblings; keeping type causes Fabrikt to resolve the
#     field as Any? instead of following the $ref to the correct type)
#   - oneOf: [$ref, {type: null}] collapsed to $ref + nullable: true (OAS 3.1
#     nullable $ref pattern; Kaizen resolves this as Any? without the fix)

topdir="$(git rev-parse --show-toplevel)"
source_spec="backend/data/static/openapi.json"

# Write temp file inside topdir so it is accessible via the Docker volume mount
tmp_spec="$(mktemp "$topdir/.fabrikt-preprocessed-XXXXXX.json")"
trap 'rm -f "$tmp_spec"' EXIT

python3 - "$topdir/$source_spec" "$tmp_spec" <<'PYEOF'
import json
import sys

src, dst = sys.argv[1], sys.argv[2]

with open(src) as f:
    spec = json.load(f)

# 1. Downgrade OpenAPI version for Kaizen compatibility
spec["openapi"] = "3.0.1"

# 2. Remove jsonSchemaDialect (3.1-only, breaks Kaizen)
spec.pop("jsonSchemaDialect", None)


def fix_node(obj):
    """Recursively fix all Kaizen-incompatible constructs."""
    if isinstance(obj, dict):
        # 3. Replace type: ["string", "null"] with type: string + nullable: true
        if "type" in obj and isinstance(obj["type"], list):
            types = obj["type"]
            non_null = [t for t in types if t != "null"]
            obj["type"] = non_null[0] if non_null else "string"
            if "null" in types:
                obj["nullable"] = True

        # 4. Remove links from response objects (triggers Kaizen LinkValidator NPE)
        obj.pop("links", None)

        # 5. Remove type when a $ref sibling is present (in OAS 3.0, $ref
        #    replaces all siblings; keeping type causes Fabrikt to resolve the
        #    field as Any? instead of following the $ref to the correct type)
        if "$ref" in obj:
            obj.pop("type", None)

        # 6. Collapse oneOf: [$ref, {type: null}] to $ref + nullable: true
        #    (OAS 3.1 nullable $ref pattern; Kaizen resolves this as Any? without
        #    the fix, because it cannot follow a $ref inside a oneOf)
        one_of = obj.get("oneOf")
        if isinstance(one_of, list) and len(one_of) == 2:
            refs = [e for e in one_of if "$ref" in e]
            nulls = [e for e in one_of if e == {"type": "null"} or e.get("type") == "null"]
            if len(refs) == 1 and len(nulls) == 1:
                obj.pop("oneOf")
                obj["$ref"] = refs[0]["$ref"]
                obj["nullable"] = True

        for v in obj.values():
            fix_node(v)
    elif isinstance(obj, list):
        for v in obj:
            fix_node(v)


fix_node(spec)

with open(dst, "w") as f:
    json.dump(spec, f)
PYEOF

# Path relative to topdir for Docker (workspace is mounted at /workspace)
tmp_rel="${tmp_spec#"$topdir/"}"

docker run --rm --user "$(id -u):$(id -g)" -v "$topdir":/workspace ghcr.io/fabrikt-io/fabrikt:latest \
	--output-directory 'kbackend' \
	--base-package "no.elhub.flex.model.dto.generated" \
	--api-file "$tmp_rel" \
	--serialization-library 'kotlinx_serialization' \
	--instant-library 'kotlin_time_instant' \
	--validation-library 'no_validation' \
	--targets 'http_models'

# TODO: https://elhub.atlassian.net/browse/FLEX-1101
# Remove Notice* models — the notice data field has no discriminator property in
# the API response, so the generated classes cannot be used for deserialisation.
rm -f "$topdir/kbackend/src/main/kotlin/no/elhub/flex/model/dto/generated/models/Notice"*.kt

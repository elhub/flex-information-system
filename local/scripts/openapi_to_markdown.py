#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""Generate Markdown tables to document the resource fields, from the YAML resource data file."""

import yaml
import sys

import tabulate as t
import argparse
from typing import NamedTuple

doc: dict = yaml.safe_load(sys.stdin)

parser = argparse.ArgumentParser(
    description="Generate a markdown table from an OpenAPI schema"
)
parser.add_argument("resource", help="The resource to generate the table for")
args = parser.parse_args()
resource = args.resource


class Row(NamedTuple):
    Name: str
    Description: str
    Format: str
    Reference: str


table: list[Row] = []

audit_fields = {
    "recorded_at": {
        "description": "When the resource was recorded (created or updated) in the system.",
        "format": "timestamp with time zone",
        "readOnly": True,
        "x-generated": True,
    },
    "recorded_by": {
        "description": "The identity that recorded the resource.",
        "format": "bigint",
        "readOnly": True,
        "x-generated": True,
    },
}

yaml_resource = next(r for r in doc["resources"] if r["id"] == resource)
properties = yaml_resource["properties"]
if yaml_resource.get("audit"):
    properties = {**properties, **audit_fields}

for field, prop in properties.items():
    # Reference
    fk = prop.get("x-foreign-key")
    ref = ""
    if fk:
        ref = (
            f"[{fk['resource']}.{fk['field']}]({fk['resource']}.md#field-{fk['field']})"
        )

    # Format
    format = prop.get("format", "")

    if prop.get("enum"):
        format += "<br/>One of: "
        format += ", ".join([f"`{e}`" for e in prop["enum"]])

    if prop.get("pattern") is not None:
        pattern = prop["pattern"].replace("|", "\\|")
        format += f"<br/>Pattern: `{pattern}`"

    readonly = prop.get("readOnly", False)
    nullable = prop.get("nullable", False)
    default = prop.get("default") is not None
    non_updatable = prop.get("x-no-update", False)
    required = prop.get("required")
    non_required = required is not None and not required

    if not readonly and not nullable and not default and not non_required:
        format += "<br/>Required"

    if prop.get("type") == "array":
        items_format = prop["items"].get("format")
        format += "<br/>Array" + (f" of {items_format}" if items_format else "")

    if default:
        format += f"<br/>Default: `{prop['default']}`"

    if prop.get("minimum") is not None:
        format += f"<br/>Min: `{prop['minimum']}`"

    if prop.get("maximum") is not None:
        format += f"<br/>Max: `{prop['maximum']}`"

    if prop.get("multipleOf") is not None:
        format += f"<br/>Multiple of: `{prop['multipleOf']}`"

    if prop.get("minLength") is not None:
        format += f"<br/>Min length: `{prop['minLength']}`"

    if prop.get("maxLength") is not None:
        format += f"<br/>Max length: `{prop['maxLength']}`"

    if readonly:
        format += "<br/>Read only"

    if non_updatable:
        format += "<br/>Non-updatable"

    if "x-details" in prop:
        format += "<br/><br/>" + prop["x-details"].replace("\n", "<br/>")

    table.append(
        Row(
            Name=f'<a name="field-{field}" href="#field-{field}">{field}</a>',
            Description=prop.get("description", "").replace("\n", "<br/>"),
            Format=format,
            Reference=ref,
        )
    )

headers = Row._fields

# To align with the Prettify markdown table function in VSCode.
t.MIN_PADDING = 0
print(t.tabulate(table, headers, tablefmt="github"))

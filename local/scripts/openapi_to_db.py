# -*- coding: utf-8 -*-
import yaml
import sys
import j2
import os
from copy import deepcopy

"""
This script generates SQL statements to create views in the `api` schema,
history tables, and triggers for history and audit, for each resource in the
OpenAPI specification. It brings more automation to the DB code and reduces the
risk of making a copy-paste mistake.
"""

DB_DIR = "./db"
output_file_backend_schema = "backend/schema.sql"
# ------------------------------------------------------------------------------

# this part generates the schema.sql input file for sqlc in the backend

# it must contain fake tables that are there only to inform sqlc about the types
# of the various fields in the views we are interacting with, as well as which
# ones are nullable, so it can type the generated Go functions accordingly


def sql_type_of_field_attr(attr):
    if attr["type"] == "array":
        if "$ref" in attr["items"]:
            # if the item is a reference, we assume it is a text enum
            return "text []"
        if "format" not in attr["items"]:
            return "jsonb []"
        return attr["items"]["format"] + " []"
    else:
        if "format" not in attr:
            return "jsonb"
        return attr["format"]


def formatted_fields(properties):
    return ",\n    ".join(
        list(
            [
                f"{field} {sql_type_of_field_attr(attr)} "
                + ("NULL" if attr.get("nullable") else "NOT NULL")
                for (field, attr) in properties.items()
            ]
        )
    )


def fake_table_create_statement(resource, properties, has_audit):
    return (
        f"""\
CREATE TABLE {resource} (
    {formatted_fields(properties)}\
"""
        + (
            """,
    recorded_by bigint NOT NULL,
    recorded_at timestamp with time zone NOT NULL\
"""
            if has_audit
            else ""
        )
        + """
);\
"""
    )


def fake_history_table_create_statement(resource, properties):
    return f"""\
CREATE TABLE {resource}_history (
    {resource}_id bigint NOT NULL,
    {formatted_fields(properties)},
    recorded_by bigint NOT NULL,
    recorded_at timestamp with time zone NOT NULL,
    replaced_by bigint NULL,
    replaced_at timestamp with time zone NULL
);\
"""


def base_comment_resource_data(base_resource):
    return {
        "id": base_resource["id"] + "_comment",
        "acronym": base_resource["acronym"] + "C",
        "summary": base_resource["summary"] + " Comment",
        "description": f"Comment made by a party involved in a {base_resource['id'].replace('_', ' ')}.",
        "operations": ["list", "read", "create", "update"],
        "audit": True,
        "generate_views": True,
        "history": ["list", "read"],
        "history_rls": True,
        "properties": {
            "id": {
                "description": "Unique surrogate identifier.",
                "format": "bigint",
                "type": "integer",
                "readOnly": True,
                "example": 9,
            },
            f"{base_resource['id']}_id": {
                "description": f"Reference to the {base_resource['id'].replace('_', ' ')}.",
                "format": "bigint",
                "type": "integer",
                "x-no-update": True,
                "x-foreign-key": {
                    "resource": base_resource["id"],
                    "field": "id",
                },
                "example": 7,
            },
            "created_by": {
                "description": "Reference to the identity that created the comment.",
                "format": "bigint",
                "type": "integer",
                "readOnly": True,
                "example": 94,
            },
            "created_at": {
                "description": "When the comment was added to the application.",
                "format": "timestamp with time zone",
                "type": "string",
                "readOnly": True,
                "example": "2022-08-08 12:00:00 CET",
            },
            "visibility": {
                "description": "The level of visibility of the comment.",
                "format": "text",
                "type": "string",
                "default": "same_party",
                "enum": ["same_party", "any_involved_party"],
                "example": "same_party",
                "x-details": (
                    "Comments marked `same_party` are visible only to the party that "
                    + "creates them, whereas comments marked `any_involved_party` can be seen "
                    + f"by all parties involved in the {base_resource['acronym'].replace('_', ' ').lower()}."
                ),
            },
            "content": {
                "description": "Free text content of the comment.",
                "format": "text",
                "type": "string",
                "maxLength": 2048,
                "example": "Missing document.",
                "x-details": (
                    "This field can contain rich text in raw HTML format. Its content "
                    + "should be sanitised on the client side before being displayed, as "
                    + "there is currently no check performed on the server."
                ),
            },
        },
    }


if __name__ == "__main__":
    yaml.SafeDumper.ignore_aliases = lambda self, data: True
    resources = yaml.safe_load(sys.stdin)
    resources = resources["resources"]

    with open(output_file_backend_schema, "w") as backend_schema_f:
        print(
            "-- AUTO-GENERATED FILE (scripts/openapi_to_db.py)\n",
            file=backend_schema_f,
        )

        for resource in resources:
            # generate fake table for sqlc in the backend
            print(
                fake_table_create_statement(
                    resource["id"],
                    resource["properties"],
                    resource.get("audit"),
                ),
                file=backend_schema_f,
            )
            if "history" in resource:
                print(
                    fake_history_table_create_statement(
                        resource["id"],
                        resource["properties"],
                    ),
                    file=backend_schema_f,
                )

            # generate sql for history table and audit triggers
            if resource.get("audit"):
                j2.template(
                    resource,
                    "resource_history_audit.j2.sql",
                    f"{DB_DIR}/flex/{resource['id']}_history_audit.sql",
                )

            # generate views and history views
            if resource.get("generate_views", False):
                j2.template(
                    resource,
                    "resource_api.j2.sql",
                    f"{DB_DIR}/api/{resource['id']}.sql",
                )

            # generate files for the comment resource
            if resource.get("comments", False):
                comment_resource_file = f"{DB_DIR}/flex/{resource['id']}_comment.sql"
                if not os.path.exists(comment_resource_file):
                    j2.template(
                        resource,
                        "comment_resource.j2.sql",
                        comment_resource_file,
                    )

                base_resource = deepcopy(resource)
                resource = base_comment_resource_data(base_resource)

                # let the user override the config in resources.yml if needed
                if isinstance(base_resource["comments"], dict):
                    for p in base_resource["comments"]:
                        resource[p] = base_resource["comments"][p]

                comment_history_file = (
                    f"{DB_DIR}/flex/{resource['id']}_history_audit.sql"
                )
                if not os.path.exists(comment_history_file):
                    j2.template(
                        resource,
                        "resource_history_audit.j2.sql",
                        comment_history_file,
                    )

                comment_view_file = f"{DB_DIR}/api/{resource['id']}.sql"
                if not os.path.exists(comment_view_file):
                    j2.template(
                        resource,
                        "resource_api.j2.sql",
                        comment_view_file,
                    )

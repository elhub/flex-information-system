# -*- coding: utf-8 -*-
import yaml
import sys
import j2

"""
This script generates SQL statements to create views in the `api` schema,
history tables, and triggers for history and audit, for each resource in the
OpenAPI specification. It brings more automation to the DB code and reduces the
risk of making a copy-paste mistake.
"""

DB_DIR = "./db"
output_file_backend_schema = "backend/schema.sql"


def history_rls_statements(base_resource, acronym):
    return f"""\
ALTER TABLE IF EXISTS {base_resource}_history
ENABLE ROW LEVEL SECURITY;

-- RLS: {acronym}-COM001
GRANT SELECT ON {base_resource}_history
TO flex_common;
CREATE POLICY "{acronym}_COM001"
ON {base_resource}_history
FOR SELECT
TO flex_common
USING (EXISTS (
    SELECT 1
    FROM {base_resource}
    WHERE {base_resource}_history.id = {base_resource}.id -- noqa
));\
"""


def view_create_statement(resource, schema_fields, has_audit):
    formatted_fields = ",\n        ".join(
        list(sorted(schema_fields - set(["id", "valid_from", "valid_to"])))
    )
    return (
        f"""\
CREATE OR REPLACE VIEW {resource}
WITH (security_invoker = true) AS (
    SELECT
        id,
        {formatted_fields}\
"""
        + (
            """,
        recorded_by,
        lower(record_time_range) AS recorded_at\
"""
            if has_audit
            else ""
        )
        + (
            """,
        lower(valid_time_range) AS valid_from,
        upper(valid_time_range) AS valid_to\
"""
            if "valid_from" in schema_fields
            else ""
        )
        + f"""
    FROM flex.{resource}
);\
"""
    )


def history_view_create_statement(base_resource, schema_fields):
    formatted_fields = ",\n        ".join(
        list(sorted(schema_fields - set(["id", "valid_from", "valid_to"])))
    )
    return (
        f"""\
CREATE OR REPLACE VIEW {base_resource}_history
WITH (
    security_invoker = true
) AS (
    SELECT
        id,
        id AS {base_resource}_id,
        {formatted_fields},
        recorded_by,
        lower(record_time_range) AS recorded_at,
        null AS replaced_by,
        null AS replaced_at\
"""
        + (
            """,
        lower(valid_time_range) AS valid_from,
        upper(valid_time_range) AS valid_to\
"""
            if "valid_from" in schema_fields
            else ""
        )
        + f"""
    FROM flex.{base_resource}
    UNION ALL
    SELECT
        history_id AS id,
        id AS {base_resource}_id,
        {formatted_fields},
        recorded_by,
        lower(record_time_range) AS recorded_at,
        replaced_by,
        upper(record_time_range) AS replaced_at\
"""
        + (
            """,
        lower(valid_time_range) AS valid_from,
        upper(valid_time_range) AS valid_to\
"""
            if "valid_from" in schema_fields
            else ""
        )
        + f"""
    FROM flex.{base_resource}_history
);\
"""
    )


# ------------------------------------------------------------------------------

# this part generates the schema.sql input file for sqlc in the backend

# it must contain fake tables that are there only to inform sqlc about the types
# of the various fields in the views we are interacting with, as well as which
# ones are nullable, so it can type the generated Go functions accordingly


def sql_type_of_field_attr(attr):
    if attr["type"] == "array":
        return attr["items"]["format"] + " []"
    else:
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
            if "history" in resource or resource.get("audit"):
                j2.template(
                    resource,
                    "resource_history_audit.j2.sql",
                    f"{DB_DIR}/flex/{resource['id']}_history_audit.sql",
                )

            # generate views and history views creation statements
            if resource.get("generate_views", False):
                with open(f"{DB_DIR}/api/{resource['id']}.sql", "w") as f:
                    print(
                        "-- AUTO-GENERATED FILE (scripts/openapi_to_db.py)\n",
                        file=f,
                    )
                    schema_fields = set(resource["properties"].keys())
                    print(
                        view_create_statement(
                            resource["id"],
                            schema_fields,
                            resource.get("audit"),
                        ),
                        file=f,
                    )
                    if "history" in resource:
                        print(file=f)
                        print(
                            history_view_create_statement(
                                resource["id"], schema_fields
                            ),
                            file=f,
                        )

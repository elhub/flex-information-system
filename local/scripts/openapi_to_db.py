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
output_file_backend_schema = "backend/api.sql"
output_file_embedding = f"{DB_DIR}/api/embedding/embedding.sql"
# ------------------------------------------------------------------------------

# this part generates the api.sql input file for sqlc in the backend

# it must contain fake tables that are there only to inform sqlc about the types
# of the various fields in the views we are interacting with, as well as which
# ones are nullable, so it can type the generated Go functions accordingly


def sql_type_of_field_attr(attr):
    # allOf with a single $ref means a referenced enum type — treat as text
    if "allOf" in attr:
        return "text"
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
        if attr["format"] == "date-time":
            return "timestamp with time zone"
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
CREATE TABLE api.{resource} (
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
CREATE TABLE api.{resource}_history (
    {resource}_id bigint NOT NULL,
    {formatted_fields(properties)},
    recorded_by bigint NOT NULL,
    recorded_at timestamp with time zone NOT NULL,
    replaced_by bigint NULL,
    replaced_at timestamp with time zone NULL
);\
"""


def embedding_name_from_field(child_field_name):
    """
    Derive the name of the embed field name.
    """
    if child_field_name.endswith("_id"):
        return child_field_name[:-3]
    return child_field_name


def embedding_name_inverse(child, parent):
    """
    Derive the name of the embed field name.
    """
    prefix = parent + "_"
    if child.startswith(prefix):
        return child[len(prefix) :]
    return child


def collect_embeds(resources):
    """
    Collect all FK relationships that have a cardinality annotation.
    Returns a list of dicts with the relationship metadata needed for the template.
    """
    embeds = []
    for resource in resources:
        child = resource["id"]
        props = resource.get("properties", {})
        for field, attr in props.items():
            if not field.endswith("_id"):
                continue
            if not isinstance(attr, dict):
                continue
            fk = attr.get("x-foreign-key")
            if not fk or "cardinality" not in fk:
                continue
            child_field = field
            parent = fk["resource"]
            parent_field = fk["field"]

            # cardinality is on the format one|many-to-one|many
            cardinality = fk["cardinality"].split("-to-")
            if len(cardinality) != 2:
                continue
            parent_cardinality, child_cardinality = cardinality

            # add fk relationship
            embeds.append(
                {
                    "child": child,
                    "child_field": child_field,
                    "parent": parent,
                    "parent_field": parent_field,
                    "cardinality": child_cardinality,
                    "embedding_name": embedding_name_from_field(child_field),
                }
            )

            # no inverse relationships for party
            if parent == "party":
                continue

            # add inverse relationship
            embeds.append(
                {
                    "child": parent,
                    "child_field": parent_field,
                    "parent": child,
                    "parent_field": child_field,
                    "cardinality": parent_cardinality,
                    "embedding_name": embedding_name_inverse(child, parent),
                }
            )
    return embeds


if __name__ == "__main__":
    yaml.SafeDumper.ignore_aliases = lambda self, data: True
    resources = yaml.safe_load(sys.stdin)
    resources = resources["resources"]

    with open(output_file_backend_schema, "w") as backend_schema_f:
        print(
            "-- AUTO-GENERATED FILE (scripts/openapi_to_db.py)\n",
            file=backend_schema_f,
        )
        print(
            "CREATE SCHEMA api;\n",
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
                    {"resource": resource["id"], "data": resource},
                    "resource_history_audit.j2.sql",
                    f"{DB_DIR}/flex/{resource['id']}_history_audit.sql",
                )

            # generate views and history views
            if resource.get("generate_views", False):
                j2.template(
                    {"resource": resource["id"], "data": resource},
                    "resource_api.j2.sql",
                    f"{DB_DIR}/api/{resource['id']}.sql",
                )

            # generate files for the comment resource
            if resource.get("comments", False):
                j2.template(
                    {"resource": resource["id"], "data": resource},
                    "comment_resource.j2.sql",
                    f"{DB_DIR}/flex/{resource['id']}_comment.sql",
                )

                j2.template(
                    {"resource": resource["id"], "data": resource},
                    "comment_rls.j2.sql",
                    f"{DB_DIR}/flex/{resource['id']}_comment_rls.sql",
                )

                resource = yaml.safe_load(
                    j2.template_str(
                        {"resource": resource["id"], "data": resource},
                        "comment_resource.j2.yml",
                    ),
                )["data"]

                print(
                    fake_table_create_statement(
                        resource["id"],
                        resource["properties"],
                        True,
                    ),
                    file=backend_schema_f,
                )

                print(
                    fake_history_table_create_statement(
                        resource["id"],
                        resource["properties"],
                    ),
                    file=backend_schema_f,
                )

                j2.template(
                    {"resource": resource["id"], "data": resource},
                    "resource_history_audit.j2.sql",
                    f"{DB_DIR}/flex/{resource['id']}_history_audit.sql",
                )

                j2.template(
                    {"resource": resource["id"], "data": resource},
                    "resource_api.j2.sql",
                    f"{DB_DIR}/api/{resource['id']}.sql",
                )

        # generate embedding functions for all FK relationships with cardinality
        embeds = collect_embeds(resources)
        j2.template(
            {"embeds": embeds},
            "embedding.j2.sql",
            output_file_embedding,
        )

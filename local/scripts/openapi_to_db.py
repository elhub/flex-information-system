# -*- coding: utf-8 -*-
import yaml
import sys
import j2
import relationship

"""
This script generates SQL statements to create views in the `api` schema,
history tables, and triggers for history and audit, for each resource in the
OpenAPI specification. It brings more automation to the DB code and reduces the
risk of making a copy-paste mistake.
"""

DB_DIR = "./db"
output_file_embedding_api = f"{DB_DIR}/api/embedding/embedding.sql"
output_file_embedding_api_history = f"{DB_DIR}/api/embedding/embedding_history.sql"
output_file_embedding_grid = f"{DB_DIR}/grid/embedding/embedding.sql"


if __name__ == "__main__":
    yaml.SafeDumper.ignore_aliases = lambda self, data: True
    resources = yaml.safe_load(sys.stdin)
    resources = resources["resources"]

    for resource in resources:
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
                {
                    "resource": resource["id"],
                    "module": resource["module"],
                    "data": resource,
                },
                "resource_view.j2.sql",
                f"{DB_DIR}/{resource['module']}/{resource['id']}.sql",
            )

        # generate files for the attachment resource
        if resource.get("attachments", False):
            j2.template(
                {"resource": resource["id"], "data": resource},
                "attachment_resource.j2.sql",
                f"{DB_DIR}/flex/{resource['id']}_attachment.sql",
            )

            j2.template(
                {"resource": resource["id"], "data": resource},
                "attachment_view.j2.sql",
                f"{DB_DIR}/attachment/{resource['id']}_attachment.sql",
            )

            attachment_resource = yaml.safe_load(
                j2.template_str(
                    {"resource": resource["id"], "data": resource},
                    "attachment_resource.j2.yml",
                ),
            )["data"]

            j2.template(
                {
                    "resource": attachment_resource["id"],
                    "data": attachment_resource,
                },
                "resource_history_audit.j2.sql",
                f"{DB_DIR}/flex/{attachment_resource['id']}_history_audit.sql",
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

            j2.template(
                {"resource": resource["id"], "data": resource},
                "resource_history_audit.j2.sql",
                f"{DB_DIR}/flex/{resource['id']}_history_audit.sql",
            )

            j2.template(
                {
                    "resource": resource["id"],
                    "module": resource["module"],
                    "data": resource,
                },
                "resource_view.j2.sql",
                f"{DB_DIR}/{resource['module']}/{resource['id']}.sql",
            )

    # generate embedding functions for all FK relationships with cardinality
    api_rels = relationship.collect(resources, module="api")
    j2.template(
        {"module": "api", "rels": [rel for rel in api_rels if not rel.history]},
        "embedding.j2.sql",
        output_file_embedding_api,
    )

    j2.template(
        {"module": "api", "rels": [rel for rel in api_rels if rel.history]},
        "embedding.j2.sql",
        output_file_embedding_api_history,
    )

    grid_rels = relationship.collect(resources, module="grid")
    j2.template(
        {"module": "grid", "rels": grid_rels},
        "embedding.j2.sql",
        output_file_embedding_grid,
    )

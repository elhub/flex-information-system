#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""Generate the OpenAPI spec from source YAML files and templates to fill them.

The OpenAPI specification output by this script is used by documentation tools
and exposed to the outside world, as a JSON file. The input of this script is
two YAML files. The first one is an OpenAPI document used as the base for the
final document. The second one is a file listing the various resources we want
to have described in the final OpenAPI specification. We use the YAML format for
both input documents as it is arguably easier to read and edit.

Information represented with templates includes in particular HTTP response
documentation, links, audit fields in the OpenAPI schemas of resources,
schemas for history resources, and the OpenAPI documentation of all the
resource-related API endpoints. Indeed, as our API design is resource-first, its
endpoints look like the underlying database operations, and as such, can have
their entries generated more easily in the specification file.

This script copies the base YAML file and completes it based on what the
resource YAML file says to generate, by copying templates listed at the
beginning of this file, and filling them if they have parameters. In this case,
they are represented as functions. Templates can be nested and contain
placeholders for smaller templates to be inserted, maximising the amount of
automation.
"""

import yaml
from typing import Any, cast
import json
import click
from copy import deepcopy
import j2

# templates


def history_schema_template(resource, resource_summary):
    return {
        "summary": f"{resource_summary} - history",
        "description": f"{resource_summary} - history",
        "allOf": [
            {"$ref": f"#/components/schemas/{resource}_response"},
            {
                "properties": {
                    f"{resource}_id": {
                        "description": "Reference to the resource that was updated.",
                        "format": "bigint",
                        "type": "integer",
                        "example": 48,
                    },
                    "replaced_by": {
                        "description": "The identity that updated the resource when it was replaced.",
                        "format": "bigint",
                        "type": "integer",
                        "nullable": True,
                        "example": 90,
                    },
                    "replaced_at": {
                        "description": "When the resource was replaced in the system.",
                        "format": "timestamp with time zone",
                        "type": "string",
                        "nullable": True,
                        "example": "2024-07-07 10:00:00 CET",
                    },
                },
                "required": [f"{resource}_id"],
            },
        ],
    }


response_templates = {
    "201": lambda resource: {
        "content": {
            "application/json": {
                "schema": {"$ref": f"#/components/schemas/{resource}_response"}
            }
        },
        "description": "Created",
    },
    "204": {"content": {}, "description": "No Content"},
    "206": {"content": {}, "description": "Partial Content"},
    "400": {
        "content": {
            "application/json": {
                "schema": {"$ref": "#/components/schemas/error_message"}
            }
        },
        "description": "Bad Request",
    },
    "401": {
        "content": {
            "application/json": {
                "schema": {"$ref": "#/components/schemas/error_message"}
            }
        },
        "description": "Unauthorized",
    },
    "403": {
        "content": {
            "application/json": {
                "schema": {"$ref": "#/components/schemas/error_message"}
            }
        },
        "description": "Forbidden",
    },
    "404": {
        "content": {
            "application/json": {
                "schema": {
                    "oneOf": [
                        {"$ref": "#/components/schemas/error_message"},
                        {"$ref": "#/components/schemas/empty_object"},
                    ]
                }
            }
        },
        "description": "Not Found",
    },
    "406": {
        "content": {
            "application/json": {
                "schema": {"$ref": "#/components/schemas/error_message"}
            }
        },
        "description": "Not Acceptable",
    },
    "409": {
        "content": {
            "application/json": {
                "schema": {"$ref": "#/components/schemas/error_message"}
            }
        },
        "description": "Conflict",
    },
    "416": {
        "content": {
            "application/json": {
                "schema": {"$ref": "#/components/schemas/error_message"}
            }
        },
        "description": "Range Not Satisfiable",
    },
    "500": {
        "content": {
            "application/json": {
                "schema": {"$ref": "#/components/schemas/error_message"}
            }
        },
        "description": "Internal Server Error",
    },
}


def template_ok_response(resource, response_code=200):
    return {
        "list": {
            "content": {
                "application/json": {
                    "schema": {
                        "items": {"$ref": f"#/components/schemas/{resource}_response"},
                        "type": "array",
                    }
                }
            },
            "description": "Partial Content" if response_code == 206 else "OK",
        },
        "read": {
            "content": {
                "application/json": {
                    "schema": {"$ref": f"#/components/schemas/{resource}_response"}
                }
            },
            "description": "OK",
        },
        "update": {
            "content": {
                "application/json": {
                    "schema": {"$ref": f"#/components/schemas/{resource}_response"}
                }
            },
            "description": "OK",
        },
    }


endpoint_templates = {
    "list": lambda base_resource, resource, resource_summary: {
        "operationId": f"list_{resource}",
        "summary": f"List {resource_summary}",
        "description": "",
        "tags": [base_resource],
        "g-responses": [200, 206, 400, 401, 403, 404, 406, 416, 500],
    },
    "create": lambda _base_resource, resource, resource_summary: {
        "operationId": f"create_{resource}",
        "summary": f"Create {resource_summary}",
        "description": "",
        "tags": [resource],
        "requestBody": {
            "content": {
                "application/json": {
                    "schema": {
                        "$ref": f"#/components/schemas/{resource}_create_request"
                    }
                }
            },
            "description": resource,
            "required": False,
        },
        "g-responses": [201, 400, 401, 403, 404, 406, 409, 500],
    },
    "read": lambda base_resource, resource, resource_summary: {
        "operationId": f"read_{resource}",
        "summary": f"Read {resource_summary}",
        "description": "",
        "tags": [base_resource],
        "g-responses": [200, 400, 401, 403, 404, 406, 500],
    },
    "update": lambda _base_resource, resource, resource_summary: {
        "operationId": f"update_{resource}",
        "summary": f"Update {resource_summary}",
        "description": "",
        "tags": [resource],
        "requestBody": {
            "content": {
                "application/json": {
                    "schema": {
                        "$ref": f"#/components/schemas/{resource}_update_request"
                    }
                }
            },
            "description": resource,
            "required": True,
        },
        "g-responses": [200, 204, 400, 401, 403, 404, 406, 409],
    },
    "delete": lambda _base_resource, resource, resource_summary: {
        "operationId": f"delete_{resource}",
        "summary": f"Delete {resource_summary}",
        "description": "",
        "tags": [resource],
        "requestBody": {
            "content": {
                "application/json": {
                    "schema": {"$ref": "#/components/schemas/empty_object"}
                }
            }
        },
        "g-responses": [204, 400, 401, 403, 404, 406],
    },
}


def id_path_parameter_template():
    return {
        "in": "path",
        "name": "id",
        "required": True,
        "schema": {"format": "bigint", "type": "integer"},
        "example": 14,
    }


def id_query_parameter_template(name, description):
    return {
        "in": "query",
        "schema": {"type": "string", "pattern": r"^eq\.[0-9]+$"},
        "example": "eq.55",
        "description": description,
        "name": name,
    }


list_parameters_template = [
    {
        "description": "Filtering Columns",
        "in": "query",
        "name": "select",
        "schema": {"type": "string"},
    },
    {
        "description": "Ordering",
        "in": "query",
        "name": "order",
        "schema": {"type": "string"},
    },
    {
        "description": "Limiting and Pagination",
        "in": "header",
        "name": "Range",
        "schema": {"type": "string"},
    },
    {
        "description": "Limiting and Pagination",
        "in": "header",
        "name": "Range-Unit",
        "schema": {"default": "items", "type": "string"},
    },
    {
        "description": "Limiting and Pagination",
        "in": "query",
        "name": "offset",
        "schema": {"type": "string"},
    },
    {
        "description": "Limiting and Pagination",
        "in": "query",
        "name": "limit",
        "schema": {"type": "string"},
    },
    {
        "description": "Preference",
        "in": "header",
        "name": "Prefer",
        "schema": {"enum": ["count=none"], "type": "string"},
    },
]


def scope_verb(operation):
    if operation in ["create", "update", "delete"]:
        return "manage"
    return "read"


def link_template(target_resource, field):
    return {
        "operationId": f"read_{target_resource}",
        "parameters": {"path.id": f"$response.body#/{field}"},
        "description": f"The `{field}` value returned in the response can be used as the `id` parameter in `GET /{target_resource}/{{id}}`.",
    }


def generate_list_parameters(resource, foreign_key_fields):
    endpoint_parameters = []

    query_filter_fields = []
    if "id" in resource["properties"]:
        query_filter_fields.append(("id", resource["properties"]["id"]))
    query_filter_fields += foreign_key_fields

    # add id and all the foreign key fields
    for field, field_info in query_filter_fields:
        parameter_template = id_query_parameter_template(
            field, field_info["description"]
        )
        endpoint_parameters.append(parameter_template)

    # add some standard parameters if they exist
    for prop in ["name", "business_id", "business_id_type"]:
        if resource["properties"].get(prop) is not None:
            parameter_template = {
                "in": "query",
                "name": prop,
                "schema": {"type": "string"},
                "example": f"eq.some{prop}",
            }
            # add description if it exists
            if resource["properties"][prop].get("description") is not None:
                parameter_template["description"] = resource["properties"][prop][
                    "description"
                ]
            endpoint_parameters.append(parameter_template)

    endpoint_parameters += list_parameters_template
    return endpoint_parameters


def generate_endpoint_responses(
    response_codes, resource_id, operation, foreign_key_fields, links=None
):
    endpoint_responses = {}

    for response_code in response_codes:
        # OK response depends on the operation, the others not
        if response_code == 200 or response_code == 206:
            response_template: dict[str, Any]
            response_template = template_ok_response(resource_id, response_code).get(
                operation
            ) or {"description": "OK"}

            # add links to the response
            if operation == "read" and links is not None:
                endpoint_links = {}

                for field, field_info in foreign_key_fields:
                    target_resource = field_info["x-foreign-key"]["resource"]

                    # create the link if not done already
                    if f"{target_resource}-{field}" not in links:
                        links[f"{target_resource}-{field}"] = link_template(
                            target_resource, field
                        )

                    endpoint_links[field] = links[f"{target_resource}-{field}"]

                if len(endpoint_links) > 0:
                    response_template["links"] = endpoint_links
        else:
            template = response_templates[str(response_code)]
            if callable(template):
                response_template = cast(dict[str, Any], template(resource_id))
            else:
                response_template = template
        endpoint_responses[str(response_code)] = response_template

    return endpoint_responses


@click.command()
@click.option("--base-file", type=click.File("r"), help="Base OpenAPI file")
@click.option("--servers-file", type=click.File("r"), help="Servers file")
@click.option("--resources-file", type=click.File("r"), help="Resources file")
def generate_openapi_document(base_file, resources_file, servers_file):
    yaml.SafeDumper.ignore_aliases = lambda self, data: True

    resources = yaml.safe_load(resources_file)
    base = yaml.safe_load(base_file)
    servers = yaml.safe_load(servers_file)

    resources = resources["resources"]

    # generate and add comment resources

    comment_resources = []
    shift = 0
    for i, resource in enumerate(resources):
        if resource.get("comments"):
            comment_resource = yaml.safe_load(
                j2.template_str(resource, "comment_resource.j2.yml"),
            )["data"]
            comment_resources.append((i + 1 + shift, comment_resource))
            shift += 1

    for i, comment_resource in comment_resources:
        resources.insert(i, comment_resource)

    # ---- TAGS ----

    # generate global tags for each resource in the resource file

    for resource in resources:
        if not any(tag["name"] == resource["id"] for tag in base["tags"]):
            base["tags"].append(
                {"name": resource["id"], "description": resource["summary"]}
            )

    # ---- SCHEMAS (under components->schemas) ----

    # In the schema section of the OpenAPI spec, audit fields are the same for all
    # resources, and history schemas can be inferred from the associated base
    # resource schema, so these entries can be turned into placeholders.

    # For history, a list of operations to document for a given resource, thus
    # requiring a history schema:
    #   history:
    #     - list

    # For audit fields, a boolean under each resource:
    #   audit: true

    schemas = base["components"]["schemas"]

    # add empty object schema

    schemas["empty_object"] = {
        "description": "An empty object",
        "type": "object",
        "properties": {},
        "additionalProperties": False,
    }

    # make sure enum fields use reusable enums to improve naming
    for resource in resources:
        for field, data in resource["properties"].items():
            if "enum" in data:
                enum_name = f"{resource['id']}_{field}"
                schemas[enum_name] = data
                resource["properties"][field] = {
                    "$ref": f"#/components/schemas/{enum_name}"
                }

    # complete the non-history schemas

    for resource in resources:
        # update schema: no readOnly or non-updatable properties
        properties_without_non_updatable_or_readonly = deepcopy(resource["properties"])
        # keep a copy of these properties (for the other schemas)
        non_updatable_properties = {}
        readonly_properties = {}
        # keep a list of required properties (for the create schema)
        required_properties = []
        # keep a list of non-nullable properties (for the response schema)
        non_nullable_properties = []

        for field, data in resource["properties"].items():
            is_nonupdatable = data.get("x-no-update", False)
            is_readonly = data.get("readOnly", False)
            is_nullable = data.get("nullable", False)
            has_default = data.get("default") is not None

            if not is_nullable:
                non_nullable_properties.append(field)

            required = data.get("required")
            is_not_required = required is not None and not required
            if required is not None:
                del data["required"]

            if is_nonupdatable:
                non_updatable_properties[field] = data
            if is_readonly:
                readonly_properties[field] = data
            if is_nonupdatable or is_readonly:
                del properties_without_non_updatable_or_readonly[field]
            if (
                not is_readonly
                and not is_nullable
                and not has_default
                and not is_not_required
            ):
                required_properties.append(field)

        # add update schema (no non-updatable or read-only properties)
        update_schema = {
            "summary": f"Update - {resource['summary']}",
            "description": f"Request schema for update operations - {resource['description']}",
            "type": "object",
        }
        # do not add properties if empty
        if len(properties_without_non_updatable_or_readonly) > 0:
            update_schema["properties"] = properties_without_non_updatable_or_readonly
        schemas[f"{resource['id']}_update_request"] = update_schema

        create_data_subschemas: list[dict] = [
            {"$ref": f"#/components/schemas/{resource['id']}_update_request"},
        ]
        # do not add properties if empty
        if len(non_updatable_properties) > 0:
            create_data_subschemas.append({"properties": non_updatable_properties})

        # add create data schema (update schema + non-updatable)
        schemas[f"{resource['id']}_create_data"] = {
            "summary": f"Create data - {resource['summary']}",
            "description": f"Data of the request schema for create operations - {resource['description']}",
            "allOf": create_data_subschemas,
            "type": "object",
        }

        if "create" in resource["operations"]:
            create_subschemas: list[dict] = [
                {"$ref": f"#/components/schemas/{resource['id']}_create_data"},
            ]
            # add schemas with required list only if non empty
            # (empty lists make the OpenAPI spec ill formed)
            if len(required_properties) > 0:
                create_subschemas.append({"required": required_properties})

            # add create schema (create_data schema [+ required])
            schemas[f"{resource['id']}_create_request"] = {
                "summary": f"Create - {resource['summary']}",
                "description": f"Request schema for create operations - {resource['description']}",
                "allOf": create_subschemas,
                "type": "object",
            }

        data_subschemas: list[dict] = [
            {"$ref": f"#/components/schemas/{resource['id']}_create_data"},
            {"properties": readonly_properties},
        ]

        if resource.get("audit"):
            data_subschemas.append({"$ref": "#/components/schemas/audit_fields"})
            non_nullable_properties += ["recorded_at", "recorded_by"]

        # add data schema (create schema + read-only)
        schemas[resource["id"]] = {
            "summary": f"Data - {resource['summary']}",
            "description": f"Data schema - {resource['description']}",
            "allOf": data_subschemas,
            "type": "object",
        }

        # add response schema (data schema + marking all fields required except the nullable ones)
        schemas[f"{resource['id']}_response"] = {
            "summary": f"Response - {resource['summary']}",
            "description": f"Response schema for operations with return values - {resource['description']}",
            "allOf": [
                {"$ref": f"#/components/schemas/{resource['id']}"},
                {"required": non_nullable_properties},
            ],
            "type": "object",
        }

    # generate the history schemas from the template

    for resource in resources:
        if resource.get("history"):
            schemas[f"{resource['id']}_history_response"] = history_schema_template(
                resource["id"], resource["summary"]
            )

    # ---- ENDPOINTS (under paths) ----

    # In the paths section of the OpenAPI spec, we list all the API endpoints,
    # with all the query parameters and all the possible responses. This causes a
    # lot of repetition. The only information needed comes in the following format,
    # listing the endpoint types we need for each resource, the id of the schema
    # to retrieve all the fields, and whether we need to generate history endpoints:

    # resources:
    #   - id: controllable_unit
    #     acronym: CU
    #     name: Controllable Unit
    #     summary: Controllable unit
    #     description: Controllable unit
    #     operations:
    #       - read
    #       - delete
    #     history:
    #       - list
    #       - read

    # NB: Some of the fields are not used in this script, but the resource file can
    #     be an input to other scripts.

    methods = {
        "list": "get",
        "create": "post",
        "read": "get",
        "update": "patch",
        "delete": "delete",
    }

    is_under_id_endpoint = {
        "list": False,
        "create": False,
        "read": True,
        "update": True,
        "delete": True,
    }

    # while generating endpoints, we will generate the required links related to
    # foreign keys (every GET endpoint has an indication, for every foreign key it
    # returns, that a query is possible on another resource using the foreign key
    # as an id)
    links = {}

    for resource in resources:
        # setup endpoint groups:
        # /resource, /resource/{id}, /resource_history, /resource_history/{id}

        resource_endpoints = {"summary": resource["summary"], "description": ""}
        at_least_one_resource_endpoint = False

        resource_id_endpoints = {
            "summary": f"{resource['summary']} - single",
            "description": "",
            "parameters": [id_path_parameter_template()],
        }
        at_least_one_resource_id_endpoint = False

        template_id_query = id_query_parameter_template(
            "id", "Identifier of the history record."
        )
        template_resource_id_query = id_query_parameter_template(
            f"{resource['id']}_id",
            f"Identifier of the {resource['summary']} whose history we want to inspect.",
        )
        resource_history_endpoints = {
            "summary": f"{resource['summary']} - history",
            "description": "",
            "parameters": [template_id_query, template_resource_id_query],
        }
        resource_history_endpoints_filled = False

        template_id_path = id_path_parameter_template()
        template_id_path["description"] = (
            "Identifier of the history record we want to inspect."
        )
        resource_history_id_endpoints = {
            "summary": f"{resource['summary']} - history record",
            "description": "",
            "parameters": [template_id_path],
        }
        resource_history_id_endpoints_filled = False

        foreign_key_fields = [
            (field, field_info)
            for field, field_info in resource["properties"].items()
            if field_info.get("x-foreign-key") is not None
        ]

        # generate endpoint for each operation

        for operation in resource["operations"]:
            endpoint_template = endpoint_templates[operation](
                resource["id"], resource["id"], resource["summary"]
            )

            if operation == "list":
                endpoint_template["parameters"] = generate_list_parameters(
                    resource, foreign_key_fields
                )

            endpoint_response_codes = endpoint_template["g-responses"]
            del endpoint_template["g-responses"]

            endpoint_template["responses"] = generate_endpoint_responses(
                endpoint_response_codes,
                resource["id"],
                operation,
                foreign_key_fields,
                links,
            )

            endpoint_template["security"] = [
                {"bearerAuth": [scope_verb(operation) + ":data:" + resource["id"]]}
            ]
            # Anon users are getting "read:data" scope, so
            # we need to add an empty security scheme defintion to signal "unauthenticated"
            if scope_verb(operation) == "read":
                endpoint_template["security"].append({})

            if is_under_id_endpoint[operation]:
                resource_id_endpoints[methods[operation]] = endpoint_template
                at_least_one_resource_id_endpoint = True
            else:
                resource_endpoints[methods[operation]] = endpoint_template
                at_least_one_resource_endpoint = True

        # generate endpoint for each history operation

        for operation in resource.get("history") or []:
            endpoint_template = endpoint_templates[operation](
                resource["id"],
                f"{resource['id']}_history",
                f"{resource['summary']} - history",
            )

            if operation == "list":
                endpoint_template["parameters"] = generate_list_parameters(
                    resource, foreign_key_fields
                )

            endpoint_response_codes = endpoint_template["g-responses"]
            del endpoint_template["g-responses"]

            endpoint_template["responses"] = generate_endpoint_responses(
                endpoint_response_codes,
                f"{resource['id']}_history",
                operation,
                foreign_key_fields,
            )

            endpoint_template["security"] = [
                {
                    "bearerAuth": [
                        scope_verb(operation) + ":data:" + resource["id"] + "_history"
                    ],
                }
            ]
            # Anon users are getting "read:data" scope, so
            # we need to add an empty security scheme defintion to signal "unauthenticated"
            if scope_verb(operation) == "read":
                endpoint_template["security"].append({})

            if is_under_id_endpoint[operation]:
                resource_history_id_endpoints[methods[operation]] = endpoint_template
                resource_history_id_endpoints_filled = True
            else:
                resource_history_endpoints[methods[operation]] = endpoint_template
                resource_history_endpoints_filled = True

        # add the endpoint groups /resource and /resource/{id} if they contain at least one endpoint
        if at_least_one_resource_endpoint:
            base["paths"][f"/{resource['id']}"] = resource_endpoints
        if at_least_one_resource_id_endpoint:
            base["paths"][f"/{resource['id']}/{{id}}"] = resource_id_endpoints

        # same for history
        if resource_history_endpoints_filled:
            base["paths"][f"/{resource['id']}_history"] = resource_history_endpoints
        if resource_history_id_endpoints_filled:
            base["paths"][f"/{resource['id']}_history/{{id}}"] = (
                resource_history_id_endpoints
            )

        # servers
        base["servers"] = [servers["api"]["dev"]]

    # ---- export ----

    print(json.dumps(base, indent=4))


if __name__ == "__main__":
    generate_openapi_document()

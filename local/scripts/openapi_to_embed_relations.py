# -*- coding: utf-8 -*-
from relationship import Relationship

"""
This module builds the embed relations of the backend based on the relationships
defined in the OpenAPI specification. It is used by openapi_to_kbackend_routes.py.

The mapping is the following:

  (parent resource, embedding name) -> embedded resource full name

This is used by the backend to resolve the correct scope when checking embed
permissions. For example, calling

  /controllable_unit_service_provider?embed=service_provider

should check the scope read:data:party, not read:data:service_provider, because
the embedded resource is actually the party table.
"""


def build_embed_mapping(rels: list[Relationship]) -> dict[str, dict[str, str]]:
    embed_mapping = {}
    for rel in rels:
        parent_resource = rel.child.resource
        embed_name = rel.name
        actual_resource = rel.parent.resource
        if parent_resource not in embed_mapping:
            embed_mapping[parent_resource] = {}
        embed_mapping[parent_resource][embed_name] = actual_resource
    return embed_mapping

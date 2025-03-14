#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""Generate the permission JSON from a permission CSV.

Input:
RESOURCE;FIELD;ANON;SO;FISO;SP;EU
gsrn;id;;R;;RC;
gsrn;gsrn;;;D;RC;
gsrn;owned_by;;;;RC;


Output:
{
    "flex_anonymous":[],
    "flex_end_user":[],
    "flex_flexibility_information_system_operator":[
        "gsrn.delete",
        "gsrn.gsrn.delete"
    ],
    "flex_service_provider":[
        "gsrn.owned_by.create",
        "gsrn.id.read",
        "gsrn.id.create",
        "gsrn.create",
        "gsrn.read",
        "gsrn.gsrn.read",
        "gsrn.owned_by.read",
        "gsrn.gsrn.create"
    ],
    "flex_system_operator":[
        "gsrn.read",
        "gsrn.id.read"
    ]
}
"""

import csv
import json
import sys

full_action_names = {
    "C": "create",
    "R": "read",
    "H": "read",
    "U": "update",
    "D": "delete",
    "L": "lookup",
}

party_type_abbr = {
    "ANON": "anonymous",
    "BRP": "balance_responsible_party",
    "EU": "end_user",
    "ES": "energy_supplier",
    "ENT": "entity",
    "FISO": "flexibility_information_system_operator",
    "MO": "market_operator",
    "SO": "system_operator",
    "SP": "service_provider",
    "TP": "third_party",
}

history_enabled = [
    "controllable_unit",
    "controllable_unit_service_provider",
    "service_providing_group",
    "service_providing_group_membership",
    "service_providing_group_grid_prequalification",
    "party",
    "party_membership",
    "technical_resource",
    "system_operator_product_type",
    "service_provider_product_application",
    "service_provider_product_application_comment",
    "service_providing_group_product_application",
]

csv_iterator = csv.reader(sys.stdin, delimiter=";")
header = next(csv_iterator)

# roles not in party_type_abbr are not relevant for the frontend, so ignored
party_types = [
    f"flex_{party_type_abbr[h]}" if h in party_type_abbr else "" for h in header[2:]
]

permissions = dict([(pt, list()) for pt in party_types])
if "" in permissions:
    del permissions[""]

for row in csv_iterator:
    resource = row[0]
    field = row[1]

    # this maps FLA inheritance from the resource to the history resource
    history_field_mapping = {
        "id": f"{resource}_id",
        "recorded_at": "replaced_at",
        "recorded_by": "replaced_by",
    }

    for party_type, perms in zip(party_types, row[2:]):
        if party_type == "":
            continue  # skip ignored roles
        for perm in perms:
            resources = [resource]
            if perm == "R" and resource in history_enabled:
                resources.append(f"{resource}_history")

            for res in resources:
                # we set resource-level permissions like resource.action
                permissions[party_type].append(f"{res}.{full_action_names[perm]}")
                # field level permission like resource.field.action
                if field not in (
                    "",
                    None,
                    "_",
                    "-",
                ):  # rows related to resource-level permissions have empty field
                    permissions[party_type].append(
                        f"{res}.{field}.{full_action_names[perm]}"
                    )

                    if (
                        field in history_field_mapping
                        and res.endswith("_history")
                        and perm == "R"
                    ):
                        permissions[party_type].append(
                            f"{res}.{history_field_mapping[field]}.{full_action_names[perm]}"
                        )


for party_type in permissions.keys():
    # removes duplicates
    permissions[party_type] = sorted(list(set(permissions[party_type])))

print(json.dumps(permissions, indent=4, sort_keys=True, separators=(",", ":")))

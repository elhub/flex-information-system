#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""Generate the permission TypeScript file from a permission CSV.

Input:
RESOURCE;FIELD;ANON;SO;FISO;SP;EU
gsrn;id;;R;;RC;
gsrn;gsrn;;;D;RC;
gsrn;owned_by;;;;RC;

Output:
TypeScript file with proper types and the permissions data.
"""

import csv
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
    "ORG": "organisation",
    "SO": "system_operator",
    "SP": "service_provider",
    "TP": "third_party",
}

history_enabled = [
    "controllable_unit",
    "controllable_unit_suspension",
    "controllable_unit_suspension_comment",
    "controllable_unit_service_provider",
    "service_providing_group",
    "service_providing_group_membership",
    "service_providing_group_grid_prequalification",
    "service_providing_group_grid_suspension",
    "service_providing_group_grid_suspension_comment",
    "party",
    "party_membership",
    "technical_resource",
    "system_operator_product_type",
    "service_provider_product_application",
    "service_provider_product_application_comment",
    "service_provider_product_suspension",
    "service_provider_product_suspension_comment",
    "service_providing_group_product_application",
    "service_providing_group_product_suspension",
    "service_providing_group_product_suspension_comment",
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

# Collect all unique permissions across all roles
all_permissions = set()
for perms in permissions.values():
    all_permissions.update(perms)
all_permissions = sorted(list(all_permissions))

# Build nested structure for permissionRefs object
# Permissions can be: resource.action or resource.field.action
# Structure: { resource: { action: "resource.action", field: { action: "resource.field.action" } } }
# Note: There's no conflict because actions and fields are at different levels

nested_permissions = {}

for perm_str in all_permissions:
    parts = perm_str.split(".")
    current = nested_permissions

    # Navigate/create nested structure for all parts except the last
    for part in parts[:-1]:
        if part not in current:
            current[part] = {}
        elif not isinstance(current[part], dict):
            # Conflict: this part was already a leaf (string), convert to object
            # This shouldn't happen with the permission format, but handle it
            existing_value = current[part]
            current[part] = {"_value": existing_value}
        current = current[part] if isinstance(current[part], dict) else {}

    # Last part is the action - store the full permission string
    action = parts[-1]
    if isinstance(current, dict):
        current[action] = perm_str

# Generate TypeScript output
print("// AUTO-GENERATED FILE - DO NOT EDIT")
print("// Generated from local/input/permissions.csv")
print("")

# Generate role type
role_names = sorted(permissions.keys())
print("export type RoleName =")
for role in role_names:
    print(f'  | "{role}"')
print(";")
print("")

# Generate Permission union type (all possible permission strings)
print("export type Permission =")
for perm in all_permissions:
    print(f'  | "{perm}"')
print(";")
print("")


# Helper function to generate nested TypeScript object
def generate_nested_object(obj, indent=0):
    """Recursively generate nested TypeScript object structure."""
    lines = []
    indent_str = "  " * indent

    if isinstance(obj, dict):
        # Separate string values (actions) from nested objects (resources/fields)
        string_keys = [k for k in obj.keys() if isinstance(obj[k], str)]
        nested_keys = [k for k in obj.keys() if isinstance(obj[k], dict)]

        # Output actions first (sorted)
        for key in sorted(string_keys):
            lines.append(f'{indent_str}{key}: "{obj[key]}",')

        # Output nested resources/fields (sorted)
        for key in sorted(nested_keys):
            lines.append(f"{indent_str}{key}: {{")
            lines.extend(generate_nested_object(obj[key], indent + 1))
            lines.append(f"{indent_str}}},")

        # Handle _value (conflict resolution - shouldn't normally happen)
        if "_value" in obj:
            lines.append(f'{indent_str}_value: "{obj["_value"]}",')
    else:
        # Should not happen
        lines.append(f'{indent_str}"{obj}",')

    return lines


# Generate the permissionRefs nested constant object
print("export const permissionRefs = {")
for line in generate_nested_object(nested_permissions, indent=1):
    print(line)
print("} as const;")
print("")

# Generate the permissions type
print("export type Permissions = Record<RoleName, Permission[]>;")
print("")

# Generate the actual permissions object
print("const permissions: Permissions = {")
for role in role_names:
    perms = permissions[role]
    print(f'  "{role}": [')
    for perm in perms:
        print(f'    "{perm}",')
    print("  ],")
print("};")
print("")
print("export default permissions;")

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

# Generate TypeScript output
print("// AUTO-GENERATED FILE - DO NOT EDIT")
print(
    "// Generated from local/input/permissions.csv by local/scripts/permissions_to_ts.py"
)
print("")

# type for all possible roles
roles = sorted(permissions.keys())
print("export type Role =", end="")
for role in roles:
    print(f'\n  | "{role}"', end="")
print(";")
print("")

# type for all possible resources and fields the permissions refer to (permission targets)
targets = sorted({p.rsplit(".", 1)[0] for p in all_permissions})
print("export type PermissionTarget =", end="")
for t in targets:
    print(f'\n  | "{t}"', end="")
print(";")
print("")

# type for all possible operations the permissions allow
operations = sorted({p.split(".")[-1] for p in all_permissions})
print("export type PermissionOperation =", end="")
for op in operations:
    print(f'\n  | "{op}"', end="")
print(";")
print("")

print("""\
export type Permissions = {
  allow: (
    _target: PermissionTarget,
    _operation: PermissionOperation,
  ) => boolean;
};
""")

print("""\
const rawPermissions: Record<
  Role,
  {target: PermissionTarget, operation: PermissionOperation}[]
> = {""")
for role, perms in permissions.items():
    print(f"  {role}: [")
    for p in perms:
        print(f"""\
    {{
      target: "{p.rsplit(".", 1)[0]}",
      operation: "{p.split(".")[-1]}",
    }},""")
    print("  ],")
print("};")
print("")

print("""\
const permissions = (role: Role): Permissions => {
  const perms = rawPermissions[role];
  return {
    allow: (target: PermissionTarget, operation: PermissionOperation): boolean =>
      perms.includes({target, operation}),
  };
};
export default permissions;""")

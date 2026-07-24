# -*- coding: utf-8 -*-

# generate openapi/scopes.yml from openapi/resources.yml

# 1. derive leaf scopes from the resource list:
#    - read operations yield a `read` scope
#    - write operations yield a `manage` scope
#    - history yields a `read` scope on the history
#    - attachment yields scopes for the related attachment resource

# 2. append a small hardcoded set for things that have no resource definition:
#    auth asset scopes, RPC (e.g., CU lookup)

# 3. compute the transitive prefix closure:
#    a scope `a:b:c:d` also yields `a:b:c` and `a:b`

import sys
import yaml

# constants

# module => scope asset
MODULE_ASSET = {
    "api": "data",
    "grid": "grid",
}

AUTH_SCOPES = [
    "read:auth",
    "use:auth",
    "manage:auth",
]

EXTRA_SCOPES = [
    "use:data:controllable_unit:lookup",
    "use:data:entity:lookup",
]

WRITE_OPS = {"create", "update", "delete"}

# helpers


# leaf scopes for a single resource under the given asset
def single_resource_leaves(rid, asset, operations, has_history):
    leaves = [f"read:{asset}:{rid}"]
    if set(operations or []) & WRITE_OPS:
        leaves.append(f"manage:{asset}:{rid}")
    if has_history:
        leaves.append(f"read:{asset}:{rid}_history")
    return leaves


# leaf scopes for a resource and its sub-resources (comments, attachments)
def resource_leaves(resource):
    module = resource.get("module", "api")
    asset = MODULE_ASSET[module]
    rid = resource["id"]

    leaves = single_resource_leaves(
        rid, asset, resource.get("operations", []), bool(resource.get("history"))
    )

    # comment: same asset, list+read (read), create (manage) + history
    if resource.get("comments"):
        leaves += single_resource_leaves(
            f"{rid}_comment", asset, ["read", "create"], True
        )

    # attachment: `attachment` asset, list+read (read), create+delete (manage) + history
    if resource.get("attachments"):
        leaves += single_resource_leaves(
            f"{rid}_attachment", "attachment", ["read", "create", "delete"], True
        )

    return leaves


# every prefix from `<verb>:<asset>` up to the full scope
def prefixes(scope):
    parts = scope.split(":")
    return [":".join(parts[:k]) for k in range(2, len(parts) + 1)]


# build the full set of scopes from the resource list
def build_scopes(resources):
    leaves = list(AUTH_SCOPES)
    for resource in resources:
        leaves += resource_leaves(resource)
    leaves += EXTRA_SCOPES

    # transitive prefix closure + sort
    scopes = set()
    for leaf in leaves:
        scopes.update(prefixes(leaf))
    return sorted(scopes)


def main():
    if len(sys.argv) != 3:
        print(f"Usage: {sys.argv[0]} <resources.yml> <scopes.yml>", file=sys.stderr)
        sys.exit(1)

    resources_path, scopes_path = sys.argv[1], sys.argv[2]

    with open(resources_path) as f:
        resources_data = yaml.safe_load(f)

    # include all modules that have a known asset
    resources = [
        r for r in resources_data["resources"] if r.get("module", "api") in MODULE_ASSET
    ]

    scopes = build_scopes(resources)

    with open(scopes_path, "w") as f:
        f.write("---\n")
        f.write("# GENERATED FILE (just generate-scopes) — do not edit manually.\n")
        f.write("scopes:\n")
        for scope in scopes:
            f.write(f"  - {scope}\n")

    print(f"Wrote {len(scopes)} scopes to {scopes_path}", file=sys.stderr)


if __name__ == "__main__":
    main()

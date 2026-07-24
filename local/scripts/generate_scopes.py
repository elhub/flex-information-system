# -*- coding: utf-8 -*-

"""
Generate openapi/scopes.yml from openapi/resources.yml.

The accepted set of scopes is computed mechanically:

1. Derive the "leaf" scopes from the resource list. Every resource yields
   `read:<asset>:<id>`, `manage:<asset>:<id>` (when it has a write operation)
   and `read:<asset>:<id>_history` (when history is enabled). Comment and
   attachment sub-resources are expanded the same way `resources_to_openapi.py`
   does. The asset is derived from the module (`api` => `data`, `grid` =>
   `grid`), except attachment sub-resources which live under the `attachment`
   asset. History scopes always live under the same asset as their resource.

2. Append a small hardcoded set for things that have no resource definition:
   the `auth` asset scopes, the RPC `:lookup` scopes and the coarse
   `use:attachment` scope (there is no `use` operation on attachments).

3. Compute the transitive prefix closure: for a scope `a:b:c:d` we also accept
   `a:b:c` and `a:b`. Prefixes shorter than `verb:asset` (2 parts) are never
   produced, which matches the `flex.scope` domain regex.

This single list feeds both the `auth_scope` enum in the OpenAPI document and
the `flex.scope_allowed()` database function.
"""

import sys
import yaml

# constants

# module => scope asset
MODULE_ASSET = {
    "api": "data",
    "grid": "grid",
}

# auth asset scopes (no resource, changes rarely); kept first
AUTH_SCOPES = [
    "read:auth",
    "use:auth",
    "manage:auth",
]

# scopes that have no resource definition and are appended after the resource
# leaves before computing the prefix closure (the closure then produces their
# coarse prefixes, e.g. `use:data` from `use:data:entity:lookup`)
EXTRA_SCOPES = [
    # RPC scopes
    "use:data:controllable_unit:lookup",
    "use:data:entity:lookup",
    # coarse "use" on attachments (no `use` operation, no leaf produces it)
    "use:attachment",
]

WRITE_OPS = {"create", "update", "delete"}

# helpers


def resource_leaves(rid, asset, operations, has_history):
    """Leaf scopes for a single (sub-)resource under the given asset."""
    leaves = [f"read:{asset}:{rid}"]
    if set(operations or []) & WRITE_OPS:
        leaves.append(f"manage:{asset}:{rid}")
    if has_history:
        leaves.append(f"read:{asset}:{rid}_history")
    return leaves


def leaves_for_resource(resource):
    """All leaf scopes contributed by a resource and its sub-resources."""
    module = resource.get("module", "api")
    asset = MODULE_ASSET[module]
    rid = resource["id"]

    leaves = resource_leaves(
        rid, asset, resource.get("operations", []), bool(resource.get("history"))
    )

    # comment sub-resource: same asset, list+read+create (=> manage) + history
    if resource.get("comments"):
        leaves += resource_leaves(f"{rid}_comment", asset, ["read", "create"], True)

    # attachment sub-resource: `attachment` asset, list/read/create/delete
    # (=> read + manage) + history
    if resource.get("attachments"):
        leaves += resource_leaves(
            f"{rid}_attachment", "attachment", ["read", "create", "delete"], True
        )

    return leaves


def prefixes(scope):
    """Every prefix of `scope` from `verb:asset` (2 parts) up to the scope."""
    parts = scope.split(":")
    return [":".join(parts[:k]) for k in range(2, len(parts) + 1)]


def build_scopes(resources):
    # gather leaves: auth first, then resource leaves, then the remaining
    # hardcoded scopes (RPC, coarse attachment use)
    leaves = list(AUTH_SCOPES)
    for resource in resources:
        leaves += leaves_for_resource(resource)
    leaves += EXTRA_SCOPES

    # transitive prefix closure, keeping a deterministic order and inserting
    # each coarse prefix right before its first specific scope
    ordered = []
    seen = set()
    for leaf in leaves:
        for scope in prefixes(leaf):
            if scope not in seen:
                seen.add(scope)
                ordered.append(scope)

    return ordered


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

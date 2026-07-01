# -*- coding: utf-8 -*-

"""
Generate openapi/scopes.yml from openapi/resources.yml.

Coarse scopes and RPC scopes are hardcoded here (no resource definition).
Every other thing under `data` and `grid` is derived mechanically from the
resources.yml file.

The auth coarse/granular scopes are hardcoded here (they have no resource
definition and change rarely). Everything under the `data` and `grid` modules
is derived mechanically from the resource list.

A resource gets `manage` only when it has at least one of the
create/update/delete operations. The history scopes are generated only if
history is enabled on the resource.
"""

import sys
import yaml

# constants

# module => scope asset
MODULE_PREFIX = {
    "api": "data",
    "grid": "grid",
}

# hardcoded auth scopes
AUTH_SCOPES = [
    "read:auth",
    "use:auth",
    "manage:auth",
]

# RPC scopes
EXTRA_USE_SCOPES = {
    "data": [
        "use:data:controllable_unit:lookup",
        "use:data:entity:lookup",
    ],
}

WRITE_OPS = {"create", "update", "delete"}

# comment resources always have list+read+create (manage) and history.
COMMENT_OPERATIONS = ["list", "read", "create"]
COMMENT_HAS_HISTORY = True

# helpers


def has_write(resource):
    return bool(set(resource.get("operations", [])) & WRITE_OPS)


def scopes_for_resource(resource):
    module = resource.get("module", "api")
    prefix = MODULE_PREFIX[module]
    rid = resource["id"]
    scopes = []

    scopes.append(f"read:{prefix}:{rid}")
    if has_write(resource):
        scopes.append(f"manage:{prefix}:{rid}")
    if resource.get("history"):
        scopes.append(f"read:{prefix}:{rid}_history")

    return scopes


def comment_scopes_for_resource(resource):
    module = resource.get("module", "api")
    prefix = MODULE_PREFIX[module]
    rid = resource["id"] + "_comment"
    # comment resources have create (manage) and history
    return [
        f"read:{prefix}:{rid}",
        f"manage:{prefix}:{rid}",
        f"read:{prefix}:{rid}_history",
    ]


def build_scopes(resources):
    by_module = {}
    for resource in resources:
        module = resource.get("module", "api")
        prefix = MODULE_PREFIX.get(module)
        if prefix is None:
            continue
        by_module.setdefault(prefix, [])
        by_module[prefix].extend(scopes_for_resource(resource))
        if resource.get("comments"):
            by_module[prefix].extend(comment_scopes_for_resource(resource))

    scopes = []

    scopes.extend(AUTH_SCOPES)

    for prefix in ["data", "grid"]:
        if prefix not in by_module:
            continue

        # coarse scopes for the module
        scopes.append(f"read:{prefix}")
        if prefix == "data":
            scopes.append(f"manage:{prefix}")
            scopes.append(f"use:{prefix}")

        # per-resource scopes
        scopes.extend(by_module[prefix])

        # extra use/RPC scopes for the module
        scopes.extend(EXTRA_USE_SCOPES.get(prefix, []))

    return scopes


def main():
    if len(sys.argv) != 3:
        print(f"Usage: {sys.argv[0]} <resources.yml> <scopes.yml>", file=sys.stderr)
        sys.exit(1)

    resources_path, scopes_path = sys.argv[1], sys.argv[2]

    with open(resources_path) as f:
        resources_data = yaml.safe_load(f)

    # include all modules that have a known prefix
    resources = [
        r
        for r in resources_data["resources"]
        if r.get("module", "api") in MODULE_PREFIX
    ]

    scopes = build_scopes(resources)

    output = {
        "_comment": "GENERATED FILE (just generate-scopes) — do not edit manually.",
        "scopes": scopes,
    }

    with open(scopes_path, "w") as f:
        f.write("---\n")
        f.write(f"# {output['_comment']}\n")
        f.write("scopes:\n")
        for scope in scopes:
            f.write(f"  - {scope}\n")

    print(f"Wrote {len(scopes)} scopes to {scopes_path}", file=sys.stderr)


if __name__ == "__main__":
    main()

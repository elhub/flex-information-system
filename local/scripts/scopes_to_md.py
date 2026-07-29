# -*- coding: utf-8 -*-

# generate docs/auth/scopes.md from openapi/scopes.yml

import sys
import yaml

SCOPES_YML = "./openapi/scopes.yml"
SCOPES_MD = "./docs/auth/scopes.md"

# module (second scope segment) |-> short description
MODULES = {
    "data": "Resources of the main data API (`/api/`).",
    "grid": "Read-only grid topology (substations, lines, ...).",
    "attachment": "File attachments attached to resources.",
    "auth": "Resources of the auth API (`/auth/`).",
}

HEADER = "\n\n".join(
    [
        "# Scopes",
        # scopes can be longer than the line limit
        "<!-- GENERATED FILE (just scopes-to-md) — do not edit manually. -->\n"
        "<!-- markdownlint-disable MD013 -->",
        (
            "This page lists every scope accepted by the Flexibility Information\n"
            "System. See the [authorisation model](authz-model.md#scopes) for what\n"
            "scopes are and how they are checked."
        ),
    ]
)


def main():
    with open(SCOPES_YML) as f:
        scopes = yaml.safe_load(f)["scopes"]

    by_module = {}
    for scope in scopes:
        module = scope.split(":")[1]
        by_module.setdefault(module, []).append(scope)

    # known modules first (in defined order), then any others sorted
    modules = [m for m in MODULES if m in by_module]
    modules += sorted(m for m in by_module if m not in MODULES)

    blocks = [HEADER]
    for module in modules:
        blocks.append(f"## `{module}`")
        if module in MODULES:
            blocks.append(MODULES[module])
        blocks.append("\n".join(f"- `{scope}`" for scope in sorted(by_module[module])))

    with open(SCOPES_MD, "w") as f:
        f.write("\n\n".join(blocks) + "\n")

    print(f"Wrote {len(scopes)} scopes to {SCOPES_MD}", file=sys.stderr)


if __name__ == "__main__":
    main()

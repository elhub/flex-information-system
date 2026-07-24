# -*- coding: utf-8 -*-

# regenerates db/flex/scope_allowed.sql from openapi/scopes.yml

import sys
import yaml
import j2

SCOPE_SQL = "./db/flex/scope_allowed.sql"
SCOPES_YML = "./openapi/scopes.yml"


def main():
    with open(SCOPES_YML) as f:
        data = yaml.safe_load(f)

    scopes = data["scopes"]
    generated = j2.template_str({"scopes": scopes}, "scope_allowed.j2.sql")

    with open(SCOPE_SQL, "w") as f:
        f.write(generated)

    print(f"Wrote {len(scopes)} scopes to {SCOPE_SQL}", file=sys.stderr)


if __name__ == "__main__":
    main()

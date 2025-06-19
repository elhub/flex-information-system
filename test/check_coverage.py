#!/usr/bin/env python3
# -*- coding: utf-8 -*-
import re
import json
from pathlib import Path

"""
This script evaluates the coverage of the existing tests. It lists the API
endpoints defined in the OpenAPI spec and the RLS policies defined in the DB,
then it checks how many of them are tested.

The script works with regex matching: the RLS policies must come with a special
comment in the DB code, and the tests must include similar comments for both
the endpoints and the RLS policies. Check the test files for examples.
"""

api_test_files = list(Path("test/api_client_tests").rglob("*.py"))
db_files = list(Path("db").rglob("*.sql"))

defined_endpoints = set()
with open("backend/data/static/openapi.json", "r") as file:
    openapi_document = json.load(file)
    for endpoint, obj in openapi_document["paths"].items():
        for attr in obj:
            if attr in ["get", "post", "patch", "delete"]:
                defined_endpoints.add(f"{attr.upper()} {endpoint}")


def search_comment_occurrences(comment, prefix, files):
    occurrences = set()
    for filename in files:
        with open(filename, "r") as file:
            for line in file.readlines():
                m = re.match(f"^ *{comment} {prefix}: (.*?) *$", line)
                if m is not None:
                    occurrences.add(m.group(1))
    return occurrences


defined_rls = search_comment_occurrences("--", "RLS", db_files)
tested_rls = search_comment_occurrences("#", "RLS", api_test_files)
tested_rls = set(filter(lambda rls: rls in defined_rls, tested_rls))
tested_endpoints = search_comment_occurrences("#", "endpoint", api_test_files)
tested_endpoints = set(filter(lambda e: e in defined_endpoints, tested_endpoints))

print("Endpoints:")
for endpoint in sorted(defined_endpoints, key=lambda e: e.split(" ")[1]):
    if endpoint in tested_endpoints:
        print(f"[x] {endpoint}")
    else:
        print(f"[ ] {endpoint}")

print("\nRLS:")
for rls in sorted(defined_rls):
    if rls in tested_rls:
        print(f"[x] {rls}")
    else:
        print(f"[ ] {rls}")

print(f"\nEndpoints tested: {len(tested_endpoints)}/{len(defined_endpoints)}")
print(f"RLS tested: {len(tested_rls)}/{len(defined_rls)}")

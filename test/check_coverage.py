#!/usr/bin/env python3
# -*- coding: utf-8 -*-
import re
from pathlib import Path

"""
This script evaluates the coverage of the existing tests. It lists the RLS
policies defined in the DB, then it checks how many of them are tested by the
kbackend API tests.

The script works with regex matching: the RLS policies must come with a special
comment in the DB code, and the tests must include similar comments for the
RLS policies they cover. Check the test files for examples.
"""

api_test_files = list(Path("kbackend/src/apiTest").rglob("*.kt"))
db_files = list(Path("db").rglob("*.sql"))


def search_comment_occurrences(comment, prefix, files):
    occurrences = set()
    for filename in files:
        with open(filename, "r") as file:
            for line in file.readlines():
                m = re.match(f"^ *{comment} {prefix}: ([^ ]+)", line)
                if m is not None:
                    occurrences.add(m.group(1).strip())
    return occurrences


defined_rls = search_comment_occurrences("--", "RLS", db_files)
tested_rls = search_comment_occurrences("//", "RLS", api_test_files)
tested_rls = set(filter(lambda rls: rls in defined_rls, tested_rls))

print("RLS:")
for rls in sorted(defined_rls):
    if rls in tested_rls:
        print(f"[x] {rls}")
    else:
        print(f"[ ] {rls}")

print(f"\nRLS tested: {len(tested_rls)}/{len(defined_rls)}")

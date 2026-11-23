#!/usr/bin/env python3
# -*- coding: utf-8 -*-
import re
from pathlib import Path

"""
This script evaluates the RLS coverage of the kbackend API tests. It lists the
RLS policies defined in the DB, then checks how many of them are tested.

The script works with regex matching: the RLS policies must come with a
`-- RLS: <ID>` comment in the DB code, and the tests must include a
`// RLS: <ID>` comment (optionally followed by an explanation). Check the test
files in kbackend/src/apiTest for examples.
"""

api_test_files = list(Path("kbackend/src/apiTest").rglob("*.kt"))
db_files = list(Path("db").rglob("*.sql"))


def search_comment_occurrences(comment, prefix, files):
    occurrences = set()
    for filename in files:
        with open(filename, "r") as file:
            for line in file.readlines():
                m = re.match(f"^ *{comment} {prefix}: (\\S+)", line)
                if m is not None:
                    occurrences.add(m.group(1))
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

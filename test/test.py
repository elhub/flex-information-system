#!/usr/bin/env python3
# -*- coding: utf-8 -*-
import argparse
from pathlib import Path
import re
import pytest

"""Main test script for the project"""

parser = argparse.ArgumentParser(description="Run tests for the Flex project")
parser.add_argument(
    "--other",
    metavar="PATTERNS",
    nargs="*",
    action="store",
    help="Run non-API-client tests whose names match one of the given patterns",
)
parser.add_argument(
    "--api",
    metavar="PATTERNS",
    nargs="*",
    action="store",
    help="Run API client tests whose names match one of the given patterns",
)
parser.add_argument(
    "--auth",
    metavar="PATTERNS",
    nargs="*",
    action="store",
    help="Run authentication tests whose names match one of the given patterns",
)

args = parser.parse_args()

api_test_files = list(Path("test/api_client_tests").glob("test_*.py"))
auth_test_files = list(Path("test/auth_tests").glob("test_*.py"))
other_test_files = list(Path("test/other_tests").glob("test_*.py"))

api_patterns = []
auth_patterns = []
other_patterns = []
if args.api is None and args.other is None and args.auth is None:
    # by default, test everything
    api_patterns = [".*"]
    auth_patterns = [".*"]
    other_patterns = [".*"]
# if at least one argument is provided, test only what is provided
else:
    if args.api is None:  # no --api
        api_patterns = []
    elif args.api == []:  # --api without filter
        api_patterns = [".*"]
    else:  # --api with filter
        api_patterns = args.api

    if args.auth is None:  # no --auth
        auth_patterns = []
    elif args.auth == []:  # --auth without filter
        auth_patterns = [".*"]
    else:  # --auth with filter
        auth_patterns = args.auth

    if args.other is None:  # no --other
        other_patterns = []
    elif args.other == []:  # --other without filter
        other_patterns = [".*"]
    else:  # --other with filter
        other_patterns = args.other

files = []
for f in api_test_files:
    if any(re.search(pattern, f.name) for pattern in api_patterns):
        files.append(f)
for f in auth_test_files:
    if any(re.search(pattern, f.name) for pattern in auth_patterns):
        files.append(f)
for f in other_test_files:
    if any(re.search(pattern, f.name) for pattern in other_patterns):
        files.append(f)

pytest.main(["-v", "test/security_token_service.py", *[str(f) for f in files]])

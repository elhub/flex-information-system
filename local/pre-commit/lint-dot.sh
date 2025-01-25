#!/usr/bin/env bash

set -euo pipefail

for file in "$@"; do
	# This validates that the file is a valid DOT file since it will parse it.
	dot -T canon "$file" >/dev/null

done

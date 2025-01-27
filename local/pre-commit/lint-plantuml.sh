#!/usr/bin/env bash

set -uo pipefail

error_count=0
for file in "$@"; do

	# Diagram name should not have an extension
	# This is to play nice with the PlantUML extension in VSCode
	if match=$(grep -E '^\@start[a-z]+\s+.*\.[a-z]+$' "$file"); then
		echo "$file has file extension in diagram name"
		echo "$match"
		echo ""
		error_count=$((error_count + 1))
	fi

	# Checking syntax
	if ! syntax=$(plantuml -syntax <"$file" 2>&1); then
		echo "Syntax error in $file"
		echo "$syntax"
		echo ""
		error_count=$((error_count + 1))
	fi

done

exit $error_count

#!/usr/bin/env bash
set -euo pipefail

# This script tests that the SPG-GP sync function works correctly, i.e., that it
# recreates missing SPG-GP records based on what the SPG-GP sync view expects.

# NB: run `just reload` before this test

PSQL="psql -X -v ON_ERROR_STOP=1 -h localhost -d flex -U postgres"

assert_eq() {
	local description="$1"
	local expected="$2"
	local actual="$3"
	if [[ $actual == "$expected" ]]; then
		echo "PASS: $description"
	else
		echo "FAIL: $description"
		echo "  expected: $expected"
		echo "  actual:   $actual"
	fi
}

query() {
	$PSQL --tuples-only --no-align -c "$1"
}

silent_query() {
	$PSQL -c "$1" >/dev/null
}

echo "=== SPG-GP sync test ==="

# 1: setup
echo ""

# find a (SPG, ISO) pair that is expected by the SPG-GP sync view and has an
# existing SPG-GP record
IFS='|' read -r spg_id iso_id < <(query "
    SELECT
        spggp.service_providing_group_id,
        spggp.impacted_system_operator_id
    FROM flex.service_providing_group_grid_prequalification spggp
        INNER JOIN flex.service_providing_group_grid_prequalification_v AS v
            ON spggp.service_providing_group_id = v.service_providing_group_id
                AND spggp.impacted_system_operator_id
                = v.impacted_system_operator_id
    LIMIT 1;
")

echo "SPG ID=$spg_id, ISO ID=$iso_id"

# delete the SPG-GP record to simulate an inconsistent state
silent_query "
    SELECT set_config('flex.current_identity', '0', true);
    DELETE FROM flex.service_providing_group_grid_prequalification
    WHERE service_providing_group_id = $spg_id
        AND impacted_system_operator_id = $iso_id;
"

# 2: run sync

# run the sync function to see if it correctly recreates the missing record
silent_query "
    SELECT set_config('flex.current_identity', '0', false);
    SELECT flex.service_providing_group_grid_prequalification_sync();
"

# 3: run checks
echo ""

# the deleted SPG-GP must have been recreated
count_recreated=$(query "
    SELECT COUNT(*) FROM flex.service_providing_group_grid_prequalification
    WHERE service_providing_group_id = $spg_id
        AND impacted_system_operator_id = $iso_id;
")
assert_eq "Deleted SPG-GP recreated after sync" "1" "$count_recreated"

# no pair expected by the view must be absent from the table
count_missing=$(query "
    SELECT COUNT(*)
    FROM flex.service_providing_group_grid_prequalification_v AS v
        LEFT JOIN flex.service_providing_group_grid_prequalification AS spggp
            ON v.service_providing_group_id = spggp.service_providing_group_id
                AND v.impacted_system_operator_id
                = spggp.impacted_system_operator_id
    WHERE spggp.service_providing_group_id IS NULL;
")
assert_eq "No expected SPG-GP missing from table after sync" "0" "$count_missing"

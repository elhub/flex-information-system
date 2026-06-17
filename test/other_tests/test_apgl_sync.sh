#!/usr/bin/env bash
set -euo pipefail

# script to check that the APGL sync mechanism works correctly

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

echo "=== APGL sync test ==="

sol_business_id="b1000001-0000-4000-8000-000000000012"
rese_business_id="a5000003-0000-4000-8000-000000000032"
banan_business_id="fa000002-0000-4000-8000-000000000022"

# ------------------------------------------------------------------------------
# trigger system guesses
# they should point to Sol even though Kobl is geometrically closer, because
# Kobl is a coupling substation (not a transformer)

echo ""
ap1=1

silent_query "SELECT flex.accounting_point_grid_location_sync();"

actual_business_id=$(query "
    SELECT business_id FROM flex.accounting_point_grid_location
    WHERE accounting_point_id = $ap1;
")
assert_eq "nearest active transformer chosen (Sol)" \
	"$sol_business_id" "$actual_business_id"

# ------------------------------------------------------------------------------
# temporarily inactivate Sol, so the sync should skip it and choose the next
# nearest active transformer instead (Rese)

echo ""
ap2=2

# inactivate Sol
silent_query "
    SELECT set_config('flex.current_identity', '0', true);
    UPDATE flex.substation SET status = 'inactive'
    WHERE business_id = '$sol_business_id';
"

# resync
silent_query "SELECT flex.accounting_point_grid_location_sync();"

actual_business_id=$(query "
    SELECT business_id FROM flex.accounting_point_grid_location
    WHERE accounting_point_id = $ap2;
")

assert_eq "inactive Sol not chosen (Rese instead)" \
	"$rese_business_id" "$actual_business_id"

# teardown: restore Sol to active
silent_query "
    SELECT set_config('flex.current_identity', '0', true);
    UPDATE flex.substation SET status = 'active'
    WHERE business_id = '$sol_business_id';
"

# ------------------------------------------------------------------------------
# AP with no location is ignored

echo ""
ap3=3

# remove guessed locations for the AP and null out its geographical location
silent_query "
    SELECT set_config('flex.current_identity', '0', true);
    UPDATE flex.accounting_point SET location = NULL WHERE id = $ap3;
    DELETE FROM flex.accounting_point_grid_location
    WHERE accounting_point_id = $ap3;
"

# resync
silent_query "SELECT flex.accounting_point_grid_location_sync();"

count_guesses=$(query "
    SELECT COUNT(*) FROM flex.accounting_point_grid_location
    WHERE accounting_point_id = $ap3;
")
assert_eq "no APGL created for AP with null location" "0" "$count_guesses"

# ------------------------------------------------------------------------------
# user written APGL is not overwritten by the sync

echo ""
ap4=4

# change source to CSO and a different transformer, so the guess is no longer
# system-sourced and we can check it has not changed
silent_query "
    SELECT set_config('flex.current_identity', '0', true);
    UPDATE flex.accounting_point_grid_location
    SET
        source = 'cso',
        business_id = '$banan_business_id'
    WHERE accounting_point_id = $ap4;
"

# resync
silent_query "SELECT flex.accounting_point_grid_location_sync();"

actual_source=$(query "
    SELECT source FROM flex.accounting_point_grid_location
    WHERE accounting_point_id = $ap4;
")
assert_eq "user-set source not overwritten" "cso" "$actual_source"

actual_business_id=$(query "
    SELECT business_id FROM flex.accounting_point_grid_location
    WHERE accounting_point_id = $ap4;
")
assert_eq "user-set business_id not overwritten" \
	"$banan_business_id" "$actual_business_id"

# ------------------------------------------------------------------------------
# 5: Existing system APGL is updated when the AP location moves
# existing system APGL is updated when there is a new nearest transformer
# (here we cause this by changing the AP's location)

echo ""
ap5=5

# move the AP to Rese's exact coordinates
silent_query "
    SELECT set_config('flex.current_identity', '0', true);
    UPDATE flex.accounting_point
    SET location = ST_SETSRID(ST_MAKEPOINT(5.3225, 60.4662), 4326)
    WHERE id = $ap5;
"

# resync
silent_query "SELECT flex.accounting_point_grid_location_sync();"

actual_business_id=$(query "
    SELECT business_id FROM flex.accounting_point_grid_location
    WHERE accounting_point_id = $ap5;
")
assert_eq "system APGL updated to Rese after AP location change" \
	"$rese_business_id" "$actual_business_id"

# ------------------------------------------------------------------------------
# idempotency: 2 syncs should change nothing

echo ""

count_before=$(query "
    SELECT COUNT(*) FROM flex.accounting_point_grid_location
    WHERE source = 'system';
")

# resync
silent_query "SELECT flex.accounting_point_grid_location_sync();"

count_after=$(query "
    SELECT COUNT(*) FROM flex.accounting_point_grid_location
    WHERE source = 'system';
")
assert_eq "system APGL count unchanged after second sync" \
	"$count_before" "$count_after"

# ------------------------------------------------------------------------------
# no AP in the fresh view should be missing from the table after sync

echo ""

count_missing=$(query "
    SELECT COUNT(*)
    FROM flex.accounting_point_grid_location_fresh AS fresh
        LEFT JOIN flex.accounting_point_grid_location AS apgl
            ON fresh.accounting_point_id = apgl.accounting_point_id
    WHERE apgl.accounting_point_id IS NULL;
")
assert_eq "no expected APGL missing from table after sync" "0" "$count_missing"

echo ""
echo "=== done ==="

-- no function as AP is public information
-- name: ControllableUnitLookupCheckAccountingPointExists :one
SELECT EXISTS (
    SELECT 1
    FROM accounting_point AS ap
    WHERE ap.business_id = @accounting_point_business_id
);

-- name: ControllableUnitLookupCheckEndUserMatchesAccountingPoint :one
SELECT controllable_unit_lookup_check_end_user_matches_accounting_point(
    @end_user_business_id::text,
    @accounting_point_business_id::text
)::boolean;

-- name: ControllableUnitLookupCheckControllableUnitExists :one
SELECT controllable_unit_lookup_check_controllable_unit_exists(
    @controllable_unit_business_id::text
)::boolean;

-- name: ControllableUnitLookupCheckEndUserMatchesControllableUnit :one
SELECT controllable_unit_lookup_check_end_user_matches_controllable_unit(
    @end_user_business_id::text,
    @controllable_unit_business_id::text
)::boolean;

-- name: ControllableUnitLookup :one
SELECT
    accounting_point_id::bigint,
    accounting_point_business_id::text,
    end_user_id::bigint,
    controllable_units::jsonb
FROM controllable_unit_lookup(
  @end_user_business_id,
  -- empty strings considered as missing values
  nullif(@controllable_unit_business_id::text, ''),
  nullif(@accounting_point_id::text, '')
);

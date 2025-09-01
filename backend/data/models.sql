-- no function as AP is public information
-- name: GetAccountingPointIDFromBusinessID :one
SELECT ap.id
FROM accounting_point AS ap
WHERE ap.business_id = @accounting_point_business_id;

-- name: GetCurrentControllableUnitAccountingPoint :one
SELECT
    accounting_point_id::bigint,
    accounting_point_business_id::text
FROM current_controllable_unit_accounting_point(
    @controllable_unit_business_id::text
);

-- name: ControllableUnitLookupCheckEndUserMatchesAccountingPoint :one
SELECT end_user_id::bigint
FROM controllable_unit_lookup_check_end_user_matches_accounting_point(
    @end_user_business_id::text,
    @accounting_point_business_id::text
);

-- name: ControllableUnitLookup :one
SELECT
    controllable_units::jsonb
FROM controllable_unit_lookup(
  -- empty strings considered as missing values
  nullif(@controllable_unit_business_id::text, ''),
  nullif(@accounting_point_id::text, '')
);

-- name: EntityLookup :one
SELECT
    entity_id::bigint,
    entity_found::boolean
FROM entity_lookup(
  @entity_business_id::text,
  @entity_name::text,
  @entity_type::text
);

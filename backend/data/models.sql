-- name: ControllableUnitLookup :one
SELECT
    accounting_point_id::bigint,
    accounting_point_business_id::text,
    end_user_id::bigint,
    controllable_units::jsonb[]
FROM controllable_unit_lookup(
  @end_user_business_id,
  -- empty strings considered as missing values
  nullif(@controllable_unit_business_id::text, ''),
  nullif(@accounting_point_id::text, '')
);

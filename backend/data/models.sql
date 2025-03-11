-- name: ControllableUnitLookup :many
SELECT
    id::bigint,
    business_id::text,
    name::text,
    accounting_point_id::text,
    end_user_id::bigint,
    technical_resources::jsonb
FROM controllable_unit_lookup(
  @end_user_id,
  -- empty strings considered as missing values
  nullif(@business_id::text, ''),
  nullif(@accounting_point_id::text, '')
);

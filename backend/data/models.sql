-- name: ControllableUnitLookupInternal :many
SELECT
    id::bigint,
    business_id::text,
    name::text,
    accounting_point_id::text,
    end_user_id::bigint,
    technical_resources::jsonb
FROM controllable_unit_lookup(
  @end_user_id, @business_id, @accounting_point_id
);

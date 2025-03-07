-- name: ControllableUnitLookup :one
SELECT controllable_unit_lookup(
  @end_user_id, @business_id, @accounting_point_id
);

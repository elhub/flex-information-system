-- name: EntityLookup :one
SELECT
    entity_id::bigint,
    entity_found::boolean
FROM api.entity_lookup(
  @entity_business_id::text,
  @entity_name::text,
  @entity_type::text,
  @entity_business_id_type::text
);

--liquibase formatted sql
-- Manually managed file

-- changeset flex:api-entity-lookup endDelimiter:-- runAlways:true
CREATE OR REPLACE FUNCTION api.entity_lookup(
    l_entity_business_id text,
    l_entity_name text,
    l_entity_type text
)
RETURNS TABLE (
    entity_id bigint,
    entity_found boolean
)
SECURITY DEFINER
LANGUAGE plpgsql
AS $$
DECLARE
    l_id bigint;
    l_found boolean := true;
BEGIN
    SELECT e.id INTO l_id FROM flex.entity AS e
    WHERE e.business_id = l_entity_business_id;

    IF l_id IS NULL THEN
        l_found := false;

        INSERT INTO flex.entity (business_id, business_id_type, name, type)
        VALUES (
          l_entity_business_id,
          CASE WHEN l_entity_type = 'person' THEN 'pid' ELSE 'org' END,
          l_entity_name,
          l_entity_type
        )
        RETURNING id INTO l_id;
    END IF;

    RETURN QUERY SELECT l_id AS entity_id, l_found AS entity_found;
END;
$$;

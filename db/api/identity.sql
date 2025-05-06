--liquibase formatted sql
-- Manually managed file

-- changeset flex:api-identity-create endDelimiter:-- runAlways:true
CREATE OR REPLACE VIEW api.identity
WITH (security_invoker = true) AS (
    SELECT
        i.id,
        i.entity_id,
        e.name AS entity_name,
        i.party_id,
        p.name AS party_name
    FROM flex.identity AS i
        LEFT JOIN flex.entity AS e
            ON i.entity_id = e.id
        LEFT JOIN flex.party AS p
            ON i.party_id = p.id
);

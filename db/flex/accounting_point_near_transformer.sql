--liquibase formatted sql
-- Manually managed file

-- changeset flex:accounting-point-near-transformer-view runOnChange:true endDelimiter:--
-- transformers within 10 km of each accounting point's geographical location
CREATE OR REPLACE VIEW accounting_point_near_transformer AS (
    SELECT
        ap.id AS accounting_point_id,
        sub.id AS substation_id
    FROM flex.accounting_point AS ap
        CROSS JOIN LATERAL (
            SELECT sub.id
            FROM flex.substation AS sub
            WHERE
                sub.kind = 'transformer'
                AND sub.status = 'active'
                AND ST_DWITHIN(
                    sub.position::geography,
                    ap.location::geography,
                    10000 -- meters
                )
        ) AS sub
    WHERE ap.location IS NOT NULL
);

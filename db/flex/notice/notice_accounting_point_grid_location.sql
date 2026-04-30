--liquibase formatted sql
-- Manually managed file

-- changeset flex:notice-accounting-point-grid-location runAlways:true endDelimiter:--

DROP VIEW IF EXISTS notice_accounting_point_grid_location_insufficient CASCADE;
DROP VIEW IF EXISTS notice_accounting_point_grid_location_missing CASCADE;
-- APs with no grid location registered
CREATE VIEW notice_accounting_point_grid_location_missing
WITH (security_invoker = false) AS (
    SELECT
        ap_so.system_operator_id AS party_id,
        'no.elhub.flex.accounting_point_grid_location.missing'::ltree AS type, -- noqa
        'accounting_point' AS source_resource,
        ap.id AS source_id,
        null::jsonb AS data, -- noqa
        md5(ap.id::text || '_' || ap_so.system_operator_id::text) AS deduplication_key -- noqa
    FROM flex.accounting_point AS ap
        INNER JOIN flex.accounting_point_system_operator AS ap_so
            ON
                ap.id = ap_so.accounting_point_id
                AND ap_so.valid_time_range @> current_timestamp
    WHERE NOT EXISTS (
        SELECT 1 FROM flex.accounting_point_grid_location AS apgl
        WHERE apgl.accounting_point_id = ap.id
    )
);

DROP VIEW IF EXISTS notice_accounting_point_grid_location_source_insufficient CASCADE;
-- APs with a grid location registered but source is not cso or grid_model
CREATE VIEW notice_accounting_point_grid_location_source_insufficient
WITH (security_invoker = false) AS (
    SELECT
        ap_so.system_operator_id AS party_id,
        'no.elhub.flex.accounting_point_grid_location.source_insufficient'::ltree AS type, -- noqa
        'accounting_point_grid_location' AS source_resource,
        apgl.id AS source_id,
        null::jsonb AS data, -- noqa
        md5(apgl.id::text || '_' || ap_so.system_operator_id::text) AS deduplication_key -- noqa
    FROM flex.accounting_point_grid_location AS apgl
        INNER JOIN flex.accounting_point_system_operator AS ap_so
            ON
                apgl.accounting_point_id = ap_so.accounting_point_id
                AND ap_so.valid_time_range @> current_timestamp
    WHERE apgl.source NOT IN ('cso', 'grid_model')
);

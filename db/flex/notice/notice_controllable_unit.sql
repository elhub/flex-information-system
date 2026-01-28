--liquibase formatted sql
-- Manually managed file

-- changeset flex:notice-controllable-unit runAlways:true endDelimiter:--

DROP VIEW IF EXISTS notice_cu_grid_node_id_missing CASCADE;
-- CU grid node ID missing
CREATE VIEW notice_cu_grid_node_id_missing
WITH (security_invoker = false) AS (
    SELECT -- noqa
        ap_so.system_operator_id AS party_id,
        'no.elhub.flex.controllable_unit.grid_node_id.missing'::ltree AS type, -- noqa
        'controllable_unit' AS source_resource,
        cu.id AS source_id,
        null::jsonb AS data, -- noqa
        md5(cu.id::text) AS key -- noqa
    FROM flex.controllable_unit AS cu
        INNER JOIN flex.accounting_point_system_operator AS ap_so
            ON
                cu.accounting_point_id = ap_so.accounting_point_id
                AND ap_so.valid_time_range @> current_timestamp
    WHERE cu.grid_node_id IS null
);

DROP VIEW IF EXISTS notice_cu_grid_validation_status_pending CASCADE;
-- CU grid validation status pending
CREATE VIEW notice_cu_grid_validation_status_pending
WITH (security_invoker = false) AS (
    SELECT
        ap_so.system_operator_id AS party_id,
        'no.elhub.flex.controllable_unit.grid_validation_status.pending'::ltree AS type, -- noqa
        'controllable_unit' AS source_resource,
        cu.id AS source_id,
        null::jsonb AS data, -- noqa
        md5(cu.id::text) AS key -- noqa
    FROM flex.controllable_unit AS cu
        INNER JOIN flex.accounting_point_system_operator AS ap_so
            ON
                cu.accounting_point_id = ap_so.accounting_point_id
                AND ap_so.valid_time_range @> current_timestamp
    WHERE
        cu.grid_validation_status = 'pending'
        AND cu.status = 'active'
);

DROP VIEW IF EXISTS notice_cu_grid_validation_status_incomplete_information CASCADE;
-- CU grid validation status incomplete information
CREATE VIEW notice_cu_grid_validation_status_incomplete_information
WITH (security_invoker = false) AS (
    SELECT
        cusp.service_provider_id AS party_id,
        'no.elhub.flex.controllable_unit.grid_validation_status.incomplete_information'::ltree AS type, -- noqa
        'controllable_unit' AS source_resource,
        cu.id AS source_id,
        null::jsonb AS data, -- noqa
        md5(cu.id::text) AS key -- noqa
    FROM flex.controllable_unit AS cu
        INNER JOIN flex.controllable_unit_service_provider AS cusp
            ON cu.id = cusp.controllable_unit_id
    WHERE
        cusp.valid_time_range @> current_timestamp
        AND cu.grid_validation_status = 'incomplete_information'
        AND cu.status = 'active'
);

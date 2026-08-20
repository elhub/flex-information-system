--liquibase formatted sql
-- Manually managed file

-- changeset flex:notice-controllable-unit runOnChange:true endDelimiter:--

-- CU maximum active power exceeds combined rated power of its technical resources
CREATE OR REPLACE VIEW notice_cu_maximum_active_power_ratio
WITH (security_invoker = false) AS (
    SELECT
        cusp.service_provider_id AS party_id,
        'no.elhub.flex.controllable_unit.maximum_active_power.ratio'::ltree AS type, -- noqa
        'controllable_unit' AS source_resource,
        cu.id AS source_id,
        null::jsonb AS data, -- noqa
        md5(cu.id::text) AS deduplication_key -- noqa
    FROM flex.controllable_unit AS cu
        INNER JOIN flex.controllable_unit_service_provider AS cusp
            ON cu.id = cusp.controllable_unit_id
                AND cusp.valid_time_range @> current_timestamp
        LEFT JOIN flex.technical_resource AS tr
            ON cu.id = tr.controllable_unit_id
    WHERE cu.status = 'active'
    GROUP BY cu.id, cu.maximum_active_power, cusp.service_provider_id
    HAVING cu.maximum_active_power > coalesce(sum(tr.maximum_active_power), 0)
);

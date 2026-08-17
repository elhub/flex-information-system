--liquibase formatted sql
-- Manually managed file

-- changeset flex:notice-controllable-unit runOnChange:true endDelimiter:--

-- CU flexible power exceeds combined rated power of its technical resources
CREATE OR REPLACE VIEW notice_cu_flexible_power_exceeds_rated_power
WITH (security_invoker = false) AS (
    SELECT
        cusp.service_provider_id AS party_id,
        'no.elhub.flex.controllable_unit.flexible_power_exceeds_rated_power'::ltree AS type, -- noqa
        'controllable_unit' AS source_resource,
        cu.id AS source_id,
        jsonb_build_object(
            'flexible_power', cu.maximum_active_power,
            'rated_power', sum(tr.maximum_active_power)
        ) AS data, --noqa
        md5(cu.id::text) AS deduplication_key -- noqa
    FROM flex.controllable_unit AS cu
        INNER JOIN flex.controllable_unit_service_provider AS cusp
            ON cu.id = cusp.controllable_unit_id
                AND cusp.valid_time_range @> current_timestamp
        INNER JOIN flex.technical_resource AS tr
            ON cu.id = tr.controllable_unit_id
    WHERE cu.status = 'active'
    GROUP BY cu.id, cu.maximum_active_power, cusp.service_provider_id
    HAVING cu.maximum_active_power > sum(tr.maximum_active_power)
);

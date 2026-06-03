--liquibase formatted sql
-- Manually managed file

-- changeset flex:notice-service-providing-group-grid-prequalification runOnChange:true endDelimiter:--

-- SPG grid prequalification status requested
CREATE OR REPLACE VIEW notice_spggp_status_requested
WITH (security_invoker = false) AS (
    SELECT
        spggp.impacted_system_operator_id AS party_id,
        'no.elhub.flex.service_providing_group_grid_prequalification.status.requested'::ltree AS type, -- noqa
        'service_providing_group_grid_prequalification' AS source_resource,
        spggp.id AS source_id,
        null::jsonb AS data, -- noqa
        md5(spggp.id::text) AS deduplication_key -- noqa
    FROM flex.service_providing_group_grid_prequalification AS spggp
    WHERE spggp.status = 'requested'
);

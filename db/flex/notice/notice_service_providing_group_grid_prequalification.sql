--liquibase formatted sql
-- Manually managed file

-- changeset flex:notice-service-providing-group-grid-prequalification runAlways:true endDelimiter:--

-- SPG grid prequalification status requested
DROP VIEW IF EXISTS notice_spggp_status_requested CASCADE;
CREATE VIEW notice_spggp_status_requested
WITH (security_invoker = false) AS (
    SELECT
        spggp.impacted_system_operator_id AS party_id,
        'no.elhub.flex.service_providing_group_grid_prequalification.status.requested'::ltree AS type, -- noqa
        'service_providing_group_grid_prequalification' AS source_resource,
        spggp.id AS source_id,
        null::jsonb AS data -- noqa
    FROM flex.service_providing_group_grid_prequalification AS spggp
    WHERE spggp.status = 'requested'
);

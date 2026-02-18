--liquibase formatted sql
-- Manually managed file

-- changeset flex:service-provider-product-suspension-involved-parties endDelimiter:-- runAlways:true
CREATE OR REPLACE VIEW
service_providing_group_grid_prequalification_involved_parties
WITH (security_invoker = false)
AS (
    SELECT
        spggp.id AS service_providing_group_grid_prequalification_id,
        unnest(ARRAY[
            spggp.impacted_system_operator_id,
            spg.service_provider_id
        ]) AS party_id
    FROM flex.service_providing_group_grid_prequalification AS spggp
        INNER JOIN flex.service_providing_group AS spg
            ON spggp.service_providing_group_id = spg.id
    UNION
    SELECT
        spggph.id,
        unnest(ARRAY[
            spggph.impacted_system_operator_id,
            spg.service_provider_id
        ]) AS party_id
    FROM flex.service_providing_group_grid_prequalification_history AS spggph
        INNER JOIN flex.service_providing_group AS spg
            ON spggph.service_providing_group_id = spg.id
);

-- changeset flex:service-provider-product-suspension-involved-parties-grants runAlways:true endDelimiter:;
GRANT SELECT ON TABLE
service_providing_group_grid_prequalification_involved_parties
TO flex_common;

GRANT SELECT ON TABLE
service_providing_group_grid_prequalification_involved_parties
TO flex_internal_event_notification;

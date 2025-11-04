--liquibase formatted sql
-- Manually managed file

-- changeset flex:service-providing-group-product-suspension-involved-parties endDelimiter:-- runAlways:true
CREATE OR REPLACE VIEW
service_providing_group_product_suspension_involved_parties
WITH (security_invoker = false)
AS (
    SELECT
        spggs.id AS service_providing_group_product_suspension_id,
        unnest(ARRAY[
            spggs.procuring_system_operator_id,
            spg.service_provider_id
        ]) AS party_id
    FROM flex.service_providing_group_product_suspension AS spggs
        INNER JOIN flex.service_providing_group AS spg
            ON spggs.service_providing_group_id = spg.id
    UNION
    SELECT
        spggsh.id,
        unnest(ARRAY[
            spggsh.procuring_system_operator_id,
            spg.service_provider_id
        ]) AS party_id
    FROM flex.service_providing_group_product_suspension_history AS spggsh
        INNER JOIN flex.service_providing_group AS spg
            ON spggsh.service_providing_group_id = spg.id
);

-- changeset flex:service-providing-group-product-suspension-involved-parties-grants runAlways:true endDelimiter:;
GRANT SELECT ON TABLE
service_providing_group_product_suspension_involved_parties
TO flex_common;

GRANT SELECT ON TABLE
service_providing_group_product_suspension_involved_parties
TO flex_internal_event_notification;

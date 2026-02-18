--liquibase formatted sql
-- Manually managed file

-- changeset flex:service-providing-group-product-application-involved-parties endDelimiter:-- runAlways:true
CREATE OR REPLACE VIEW
service_providing_group_product_application_involved_parties
WITH (security_invoker = false)
AS (
    SELECT
        spgpa.id AS service_providing_group_product_application_id,
        unnest(ARRAY[
            spgpa.procuring_system_operator_id,
            spg.service_provider_id
        ]) AS party_id
    FROM flex.service_providing_group_product_application AS spgpa
        INNER JOIN flex.service_providing_group AS spg
            ON spgpa.service_providing_group_id = spg.id
    UNION
    SELECT
        spgpah.id,
        unnest(ARRAY[
            spgpah.procuring_system_operator_id,
            spg.service_provider_id
        ]) AS party_id
    FROM flex.service_providing_group_product_application AS spgpah
        INNER JOIN flex.service_providing_group AS spg
            ON spgpah.service_providing_group_id = spg.id
);

-- changeset flex:service-providing-group-product-application-involved-parties-grants runAlways:true endDelimiter:;
GRANT SELECT ON TABLE
service_providing_group_product_application_involved_parties
TO flex_common;

GRANT SELECT ON TABLE
service_providing_group_product_application_involved_parties
TO flex_internal_event_notification;

--liquibase formatted sql
-- Manually managed file

-- changeset flex:service-provider-product-suspension-involved-parties endDelimiter:-- runAlways:true
CREATE OR REPLACE VIEW
service_provider_product_suspension_involved_parties
WITH (security_invoker = false)
AS (
    SELECT
        spps.id AS service_provider_product_suspension_id,
        unnest(ARRAY[
            spps.procuring_system_operator_id,
            spps.service_provider_id
        ]) AS party_id
    FROM flex.service_provider_product_suspension AS spps
    UNION
    SELECT
        sppsh.id,
        unnest(ARRAY[
            sppsh.procuring_system_operator_id,
            sppsh.service_provider_id
        ]) AS party_id
    FROM flex.service_provider_product_suspension_history AS sppsh
);

-- changeset flex:service-provider-product-suspension-involved-parties-grants runAlways:true endDelimiter:;
GRANT SELECT ON TABLE
service_provider_product_suspension_involved_parties
TO flex_common;

GRANT SELECT ON TABLE
service_provider_product_suspension_involved_parties
TO flex_internal_event_notification;

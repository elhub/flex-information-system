--liquibase formatted sql
-- Manually managed file
-- noqa: disable=RF04,ST06
-- RF04 - Keywords should not be used as identifiers.
-- ST06 - Select wildcards then simple targets before calculations and aggregates.

-- changeset flex:api-service-providing-group-product-application-attachment-create endDelimiter:-- runOnChange:true
CREATE OR REPLACE VIEW
api.service_providing_group_product_application_attachment
WITH (security_invoker = true) AS (
    SELECT
        id,
        recorded_by,
        lower(record_time_range) AS recorded_at,
        service_providing_group_product_application_id,
        object_id,
        name,
        content_type,
        size_bytes
    FROM flex.service_providing_group_product_application_attachment
);

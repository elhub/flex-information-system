--liquibase formatted sql
-- GENERATED CODE -- DO NOT EDIT (scripts/openapi_to_db.py)
-- noqa: disable=RF04,ST06
-- RF04 - Keywords should not be used as identifiers.
-- ST06 - Select wildcards then simple targets before calculations and aggregates.

-- changeset flex:api-service-providing-group-create endDelimiter:-- runOnChange:true
CREATE OR REPLACE VIEW
api.service_providing_group
WITH (security_invoker = true) AS (
    SELECT
        id,
        recorded_by,
        lower(record_time_range) AS recorded_at,
        name,
        service_provider_id,
        bidding_zone,
        status,
        additional_information
    FROM flex.service_providing_group
);
-- changeset flex:api-service-providing-group-history-create endDelimiter:-- runOnChange:true
CREATE OR REPLACE VIEW
api.service_providing_group_history
WITH (
    security_invoker = true
) AS (
    SELECT
        id,
        id AS service_providing_group_id,
        recorded_by,
        lower(record_time_range) AS recorded_at,
        null AS replaced_by,
        null AS replaced_at,
        name,
        service_provider_id,
        bidding_zone,
        status,
        additional_information
    FROM flex.service_providing_group
    UNION ALL
    SELECT
        history_id AS id,
        id AS service_providing_group_id,
        recorded_by,
        lower(record_time_range) AS recorded_at,
        replaced_by,
        upper(record_time_range) AS replaced_at,
        name,
        service_provider_id,
        bidding_zone,
        status,
        additional_information
    FROM flex.service_providing_group_history
);

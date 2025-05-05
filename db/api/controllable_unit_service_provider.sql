--liquibase formatted sql
-- GENERATED CODE -- DO NOT EDIT (scripts/openapi_to_db.py)

-- changeset flex:api-controllable-unit-service-provider-create endDelimiter:-- runAlways:true
CREATE OR REPLACE VIEW api.controllable_unit_service_provider
WITH (security_invoker = true) AS (
    SELECT
        id,
        contract_reference,
        controllable_unit_id,
        service_provider_id,
        recorded_by,
        lower(record_time_range) AS recorded_at,
        lower(valid_time_range) AS valid_from,
        upper(valid_time_range) AS valid_to
    FROM flex.controllable_unit_service_provider
);
-- changeset flex:api-controllable-unit-service-provider-history-create endDelimiter:-- runAlways:true
CREATE OR REPLACE VIEW api.controllable_unit_service_provider_history
WITH (
    security_invoker = true
) AS (
    SELECT
        id,
        id AS controllable_unit_service_provider_id,
        contract_reference,
        controllable_unit_id,
        service_provider_id,
        recorded_by,
        lower(record_time_range) AS recorded_at,
        null AS replaced_by,
        null AS replaced_at,
        lower(valid_time_range) AS valid_from,
        upper(valid_time_range) AS valid_to
    FROM flex.controllable_unit_service_provider
    UNION ALL
    SELECT
        history_id AS id,
        id AS controllable_unit_service_provider_id,
        contract_reference,
        controllable_unit_id,
        service_provider_id,
        recorded_by,
        lower(record_time_range) AS recorded_at,
        replaced_by,
        upper(record_time_range) AS replaced_at,
        lower(valid_time_range) AS valid_from,
        upper(valid_time_range) AS valid_to
    FROM flex.controllable_unit_service_provider_history
);

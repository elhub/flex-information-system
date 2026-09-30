--liquibase formatted sql
-- GENERATED CODE -- DO NOT EDIT (scripts/openapi_to_db.py)
-- noqa: disable=RF04,ST06
-- RF04 - Keywords should not be used as identifiers.
-- ST06 - Select wildcards then simple targets before calculations and aggregates.

-- changeset flex:api-controllable-unit-service-provider-create endDelimiter:-- runOnChange:true
CREATE OR REPLACE VIEW
api.controllable_unit_service_provider
WITH (security_invoker = true) AS (
    SELECT
        id,
        recorded_by,
        lower(record_time_range) AS recorded_at,
        lower(valid_time_range) AS valid_from,
        upper(valid_time_range) AS valid_to,
        controllable_unit_id,
        service_provider_id,
        end_user_id,
        contract_reference
    FROM flex.controllable_unit_service_provider
);
-- changeset flex:api-controllable-unit-service-provider-history-create endDelimiter:-- runOnChange:true
CREATE OR REPLACE VIEW
api.controllable_unit_service_provider_history
WITH (
    security_invoker = true
) AS (
    SELECT
        id,
        id AS controllable_unit_service_provider_id,
        recorded_by,
        lower(record_time_range) AS recorded_at,
        null AS replaced_by,
        null AS replaced_at,
        lower(valid_time_range) AS valid_from,
        upper(valid_time_range) AS valid_to,
        controllable_unit_id,
        service_provider_id,
        end_user_id,
        contract_reference
    FROM flex.controllable_unit_service_provider
    UNION ALL
    SELECT
        history_id AS id,
        id AS controllable_unit_service_provider_id,
        recorded_by,
        lower(record_time_range) AS recorded_at,
        replaced_by,
        upper(record_time_range) AS replaced_at,
        lower(valid_time_range) AS valid_from,
        upper(valid_time_range) AS valid_to,
        controllable_unit_id,
        service_provider_id,
        end_user_id,
        contract_reference
    FROM flex.controllable_unit_service_provider_history
);

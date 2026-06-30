--liquibase formatted sql
-- GENERATED CODE -- DO NOT EDIT (scripts/openapi_to_db.py)
-- noqa: disable=RF04,ST06
-- RF04 - Keywords should not be used as identifiers.
-- ST06 - Select wildcards then simple targets before calculations and aggregates.

-- changeset flex:api-accounting-point-grid-location-create endDelimiter:-- runOnChange:true
CREATE OR REPLACE VIEW
api.accounting_point_grid_location
WITH (security_invoker = true) AS (
    SELECT
        id,
        recorded_by,
        lower(record_time_range) AS recorded_at,
        accounting_point_id,
        object_type,
        business_id,
        name,
        nominal_voltage,
        additional_information,
        source,
        quality
    FROM flex.accounting_point_grid_location
);
-- changeset flex:api-accounting-point-grid-location-history-create endDelimiter:-- runOnChange:true
CREATE OR REPLACE VIEW
api.accounting_point_grid_location_history
WITH (
    security_invoker = true
) AS (
    SELECT
        id,
        id AS accounting_point_grid_location_id,
        recorded_by,
        lower(record_time_range) AS recorded_at,
        null AS replaced_by,
        null AS replaced_at,
        accounting_point_id,
        object_type,
        business_id,
        name,
        nominal_voltage,
        additional_information,
        source,
        quality
    FROM flex.accounting_point_grid_location
    UNION ALL
    SELECT
        history_id AS id,
        id AS accounting_point_grid_location_id,
        recorded_by,
        lower(record_time_range) AS recorded_at,
        replaced_by,
        upper(record_time_range) AS replaced_at,
        accounting_point_id,
        object_type,
        business_id,
        name,
        nominal_voltage,
        additional_information,
        source,
        quality
    FROM flex.accounting_point_grid_location_history
);

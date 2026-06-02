--liquibase formatted sql
-- GENERATED CODE -- DO NOT EDIT (scripts/openapi_to_db.py)

-- changeset flex:api-accounting-point-grid-location-create endDelimiter:-- runOnChange:true
CREATE OR REPLACE VIEW
api.accounting_point_grid_location
WITH (security_invoker = true) AS (
    SELECT
        id,
        accounting_point_id,
        additional_information,
        business_id,
        name,
        nominal_voltage,
        object_type,
        quality,
        source,
        recorded_by,
        lower(record_time_range) AS recorded_at
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
        accounting_point_id,
        additional_information,
        business_id,
        name,
        nominal_voltage,
        object_type,
        quality,
        source,
        recorded_by,
        lower(record_time_range) AS recorded_at,
        null AS replaced_by,
        null AS replaced_at
    FROM flex.accounting_point_grid_location
    UNION ALL
    SELECT
        history_id AS id,
        id AS accounting_point_grid_location_id,
        accounting_point_id,
        additional_information,
        business_id,
        name,
        nominal_voltage,
        object_type,
        quality,
        source,
        recorded_by,
        lower(record_time_range) AS recorded_at,
        replaced_by,
        upper(record_time_range) AS replaced_at
    FROM flex.accounting_point_grid_location_history
);

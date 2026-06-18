--liquibase formatted sql
-- Manually managed file

-- changeset flex:grid-accounting-point-near-transformer-create runOnChange:true endDelimiter:--
CREATE OR REPLACE VIEW
grid.accounting_point_near_transformer
WITH (security_invoker = true) AS (
    SELECT
        accounting_point_id,
        substation_id
    FROM flex.accounting_point_near_transformer
);

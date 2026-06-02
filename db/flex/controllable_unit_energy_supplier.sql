--liquibase formatted sql
-- Manually managed file

-- changeset flex:accounting-point-energy-supplier-create runOnChange:true endDelimiter:--
CREATE OR REPLACE VIEW controllable_unit_energy_supplier AS (
    SELECT
        cu.id AS controllable_unit_id,
        apes.energy_supplier_id,
        apes.valid_time_range
    FROM flex.controllable_unit AS cu
        LEFT JOIN flex.accounting_point_energy_supplier AS apes
            ON cu.accounting_point_id = apes.accounting_point_id
);

-- changeset flex:controllable-unit-energy-supplier-grants runOnChange:true endDelimiter:;
GRANT SELECT ON TABLE controllable_unit_energy_supplier
TO flex_common;

GRANT SELECT ON TABLE controllable_unit_energy_supplier
TO flex_internal_event_notification;

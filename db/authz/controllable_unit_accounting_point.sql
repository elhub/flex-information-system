CREATE OR REPLACE VIEW controllable_unit_accounting_point AS (
    SELECT
        cu.id AS controllable_unit_id,
        ap.id AS accounting_point_id,
        ap.business_id AS accounting_point_business_id,
        ap.system_operator_id AS accounting_point_system_operator_id
    FROM flex.controllable_unit AS cu
        INNER JOIN flex.accounting_point AS ap
            ON cu.accounting_point_id = ap.business_id
);

GRANT SELECT ON TABLE controllable_unit_accounting_point
TO flex_common;

--liquibase formatted sql
-- Manually managed file

-- changeset flex:accounting-point-procuring-system-operator-create runOnChange:true endDelimiter:--
CREATE OR REPLACE VIEW accounting_point_procuring_system_operator
WITH (security_invoker = false) AS (
    -- Use for auth. Security invoker to bypass RLS
    SELECT
        cu.accounting_point_id,
        cu.id AS controllable_unit_id,
        spgpa.service_providing_group_id,
        spgpa.procuring_system_operator_id
    FROM flex.service_providing_group_membership AS spgm
        INNER JOIN flex.controllable_unit AS cu
            ON spgm.controllable_unit_id = cu.id
        INNER JOIN flex.service_providing_group_product_application AS spgpa
            ON spgm.service_providing_group_id = spgpa.service_providing_group_id
);

-- changeset flex:accounting-point-procuring-system-operator-grants runOnChange:true endDelimiter:;
GRANT SELECT ON TABLE accounting_point_procuring_system_operator
TO flex_common;

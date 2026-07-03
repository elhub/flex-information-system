--liquibase formatted sql
-- Manually managed file

-- changeset flex:controllable-unit-procuring-system-operator-create runOnChange:true endDelimiter:--
CREATE OR REPLACE VIEW controllable_unit_procuring_system_operator
WITH (security_invoker = false) AS (
    -- Use for auth. Security invoker to bypass RLS
    SELECT
        spgm.id AS controllable_unit_id,
        spgpa.service_providing_group_id,
        spgpa.procuring_system_operator_id
    FROM flex.service_providing_group_membership AS spgm
        INNER JOIN flex.service_providing_group_product_application AS spgpa
            ON spgm.service_providing_group_id = spgpa.service_providing_group_id
);

-- changeset flex:controllable-unit-procuring-system-operator-grants runOnChange:true endDelimiter:;
GRANT SELECT ON TABLE controllable_unit_procuring_system_operator
TO flex_common;

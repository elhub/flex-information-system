--liquibase formatted sql
-- Manually managed file

-- changeset flex:controllable-unit-impacted-system-operator-create runOnChange:true endDelimiter:--
CREATE OR REPLACE VIEW controllable_unit_impacted_system_operator
WITH (security_invoker = false) AS (
    -- Use for auth. Security invoker to bypass RLS
    SELECT
        spgm.controllable_unit_id,
        spggp.service_providing_group_id,
        spggp.impacted_system_operator_id,
        spgm.valid_time_range
    FROM flex.service_providing_group_membership AS spgm
        INNER JOIN flex.service_providing_group_grid_prequalification AS spggp
            ON spgm.service_providing_group_id = spggp.service_providing_group_id
);

-- changeset flex:controllable-unit-bidding-zone-grants runOnChange:true endDelimiter:;
GRANT SELECT ON TABLE controllable_unit_impacted_system_operator
TO flex_common;

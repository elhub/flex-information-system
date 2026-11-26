--liquibase formatted sql
-- Manually managed file

-- indexes for the lookup of deleted memberships by CU (used in CU RLS)
-- changeset flex:controllable-unit-procuring-system-operator-membership-history-cu-idx runOnChange:true endDelimiter:-- runInTransaction:false
CREATE INDEX CONCURRENTLY IF NOT EXISTS
service_providing_group_membership_history_controllable_unit_idx
ON service_providing_group_membership_history (controllable_unit_id);

-- changeset flex:controllable-unit-procuring-system-operator-create runOnChange:true endDelimiter:--
-- The CUs that are, or have been, members of a SPG with a product application
-- for the PSO. Deleted memberships are moved to the history table, so they are
-- included to keep the access to the CU (and its history) after it is removed
-- from the group.
-- NB: the history table is created after the other views, so this one must be
-- included after the history tables in the changelog.
CREATE OR REPLACE VIEW controllable_unit_procuring_system_operator
WITH (security_invoker = false) AS (
    -- Use for auth. Security invoker to bypass RLS
    SELECT
        spgm.controllable_unit_id,
        spgpa.service_providing_group_id,
        spgpa.procuring_system_operator_id,
        spgm.valid_time_range
    FROM flex.service_providing_group_membership AS spgm
        INNER JOIN flex.service_providing_group_product_application AS spgpa
            ON spgm.service_providing_group_id = spgpa.service_providing_group_id

    UNION ALL

    SELECT
        spgmh.controllable_unit_id,
        spgpa.service_providing_group_id,
        spgpa.procuring_system_operator_id,
        spgmh.valid_time_range
    FROM flex.service_providing_group_membership_history AS spgmh
        INNER JOIN flex.service_providing_group_product_application AS spgpa
            ON spgmh.service_providing_group_id = spgpa.service_providing_group_id
);

-- changeset flex:controllable-unit-procuring-system-operator-grants runOnChange:true endDelimiter:;
GRANT SELECT ON TABLE controllable_unit_procuring_system_operator
TO flex_common;

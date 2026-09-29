--liquibase formatted sql
-- Manually managed file

-- changeset flex:service-providing-group-membership-grid-prequalification-trigger-delete runOnChange:true endDelimiter:;
-- TODO remove once rollout is complete
DROP TRIGGER IF EXISTS spgm_insert_grid_prequalification
ON flex.service_providing_group_membership;
DROP FUNCTION IF EXISTS flex.spgm_insert_grid_prequalification;

-- changeset flex:service-providing-group-membership-cascade-delete-spgpa-function runOnChange:true endDelimiter:--
-- terminate SPGPA when the last CU is removed (or its SPG membership ends)
CREATE OR REPLACE FUNCTION
service_providing_group_membership_cascade_delete_spgpa()
RETURNS trigger
SECURITY DEFINER
LANGUAGE plpgsql
AS
$$
DECLARE
    l_spg_id bigint := COALESCE(
        NEW.service_providing_group_id, OLD.service_providing_group_id
    );
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM flex.service_providing_group_membership
        WHERE service_providing_group_id = l_spg_id
            AND valid_time_range @> current_timestamp
    ) THEN
        UPDATE flex.service_providing_group_product_application
        SET status = 'terminated'
        WHERE service_providing_group_id = l_spg_id
        AND status != 'terminated';
    END IF;

    RETURN NULL;
END;
$$;

-- changeset flex:service-providing-group-membership-cascade-delete-spgpa-trigger runOnChange:true endDelimiter:--
CREATE OR REPLACE TRIGGER service_providing_group_membership_cascade_delete_spgpa
AFTER INSERT OR UPDATE OR DELETE ON flex.service_providing_group_membership
FOR EACH ROW
EXECUTE FUNCTION service_providing_group_membership_cascade_delete_spgpa();

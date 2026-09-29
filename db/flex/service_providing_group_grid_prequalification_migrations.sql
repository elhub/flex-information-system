--liquibase formatted sql
-- Manually managed file

-- changeset flex:service-providing-group-grid-prequalification-status-approved-function runOnChange:true endDelimiter:--
CREATE OR REPLACE FUNCTION spg_grid_prequalification_status_approved()
RETURNS trigger
SECURITY INVOKER
LANGUAGE plpgsql
AS
$$
BEGIN
    NEW.prequalified_at := current_timestamp;
    RETURN NEW;
END;
$$;

-- changeset flex:service-providing-group-grid-prequalification-status-approved-trigger runOnChange:true endDelimiter:--
CREATE OR REPLACE TRIGGER spg_grid_prequalification_status_approved
BEFORE UPDATE OF status
ON service_providing_group_grid_prequalification
FOR EACH ROW
WHEN (
    OLD.status IS DISTINCT FROM NEW.status -- noqa
    AND NEW.status = 'approved' -- noqa
    AND OLD.prequalified_at IS NULL AND NEW.prequalified_at IS NULL -- noqa
)
EXECUTE FUNCTION spg_grid_prequalification_status_approved();

-- changeset flex:spggp-add-terminated-status runOnChange:false endDelimiter:;
--preconditions onFail:MARK_RAN
--precondition-sql-check expectedResult:0 SELECT COUNT(*) FROM pg_catalog.pg_constraint WHERE conname = 'service_providing_group_grid_prequalification_status_check' AND pg_get_constraintdef(oid) LIKE '%terminated%'
ALTER TABLE flex.service_providing_group_grid_prequalification
DROP CONSTRAINT IF EXISTS service_providing_group_grid_prequalification_status_check;
ALTER TABLE flex.service_providing_group_grid_prequalification
ADD CONSTRAINT service_providing_group_grid_prequalification_status_check
CHECK (
    status IN (
        'requested',
        'in_progress',
        'conditionally_approved',
        'approved',
        'not_approved',
        'terminated'
    )
);

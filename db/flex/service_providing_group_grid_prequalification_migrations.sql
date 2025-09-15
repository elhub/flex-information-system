--liquibase formatted sql
-- Manually managed file

-- changeset flex:service-providing-group-grid-prequalification-rename-prequalified-at runOnChange:false endDelimiter:;
--preconditions onFail:MARK_RAN
--precondition-sql-check expectedResult:1 SELECT COUNT(*) FROM information_schema.columns WHERE table_schema = 'flex' AND table_name = 'service_providing_group_grid_prequalification' AND column_name = 'last_prequalified'
ALTER TABLE flex.service_providing_group_grid_prequalification
RENAME COLUMN last_prequalified TO prequalified_at;
ALTER TABLE flex.service_providing_group_grid_prequalification_history
RENAME COLUMN last_prequalified TO prequalified_at;

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

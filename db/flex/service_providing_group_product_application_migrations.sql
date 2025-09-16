--liquibase formatted sql
-- Manually managed file

-- changeset flex:service-providing-group-product-application-rename-prequalified-verified-at runOnChange:false endDelimiter:;
--preconditions onFail:MARK_RAN
--precondition-sql-check expectedResult:2 SELECT COUNT(*) FROM information_schema.columns WHERE table_schema = 'flex' AND table_name = 'service_providing_group_product_application' AND column_name IN ('last_prequalified', 'last_verified')
ALTER TABLE flex.service_providing_group_product_application
RENAME COLUMN last_prequalified TO prequalified_at;
ALTER TABLE flex.service_providing_group_product_application_history
RENAME COLUMN last_prequalified TO prequalified_at;

ALTER TABLE flex.service_providing_group_product_application
RENAME COLUMN last_verified TO verified_at;
ALTER TABLE flex.service_providing_group_product_application_history
RENAME COLUMN last_verified TO verified_at;

-- changeset flex:service-providing-group-product-application-status-prequalified-function runOnChange:true endDelimiter:--
-- trigger to first set the last prequalified timestamp if not done by the user
CREATE OR REPLACE FUNCTION
service_providing_group_product_application_status_prequalified()
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

-- changeset flex:service-providing-group-product-application-status-prequalified-trigger runOnChange:true endDelimiter:--
CREATE OR REPLACE TRIGGER
service_providing_group_product_application_status_prequalified
BEFORE UPDATE OF status ON service_providing_group_product_application
FOR EACH ROW
WHEN (
    OLD.status IS DISTINCT FROM NEW.status -- noqa
    AND NEW.status = 'prequalified' -- noqa
    AND OLD.prequalified_at IS NULL AND NEW.prequalified_at IS NULL -- noqa
)
EXECUTE FUNCTION
service_providing_group_product_application_status_prequalified();

-- changeset flex:service-providing-group-product-application-status-verified-function runOnChange:true endDelimiter:--
-- trigger to first set the last verified timestamp if not done by the user
CREATE OR REPLACE FUNCTION
service_providing_group_product_application_status_verified()
RETURNS trigger
SECURITY INVOKER
LANGUAGE plpgsql
AS
$$
BEGIN
    NEW.verified_at := current_timestamp;
    RETURN NEW;
END;
$$;

-- changeset flex:service-providing-group-product-application-status-verified-trigger runOnChange:true endDelimiter:--
CREATE OR REPLACE TRIGGER
service_providing_group_product_application_status_verified
BEFORE UPDATE OF status ON service_providing_group_product_application
FOR EACH ROW
WHEN (
    OLD.status IS DISTINCT FROM NEW.status -- noqa
    AND NEW.status = 'verified' -- noqa
    AND OLD.verified_at IS NULL AND NEW.verified_at IS NULL -- noqa
)
EXECUTE FUNCTION service_providing_group_product_application_status_verified();

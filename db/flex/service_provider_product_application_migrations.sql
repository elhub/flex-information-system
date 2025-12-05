--liquibase formatted sql
-- Manually managed file

-- changeset flex:service-provider-product-application-rename-qualified-at runOnChange:false endDelimiter:;
--preconditions onFail:MARK_RAN
--precondition-sql-check expectedResult:1 SELECT COUNT(*) FROM information_schema.columns WHERE table_schema = 'flex' AND table_name = 'service_provider_product_application' AND column_name = 'last_qualified'
ALTER TABLE flex.service_provider_product_application
RENAME COLUMN last_qualified TO qualified_at;
ALTER TABLE flex.service_provider_product_application_history
RENAME COLUMN last_qualified TO qualified_at;

-- changeset flex:service-provider-product-application-status-qualified-function runOnChange:true endDelimiter:--
-- trigger to first set the last qualified timestamp if not done by the user
CREATE OR REPLACE FUNCTION
service_provider_product_application_status_qualified()
RETURNS trigger
SECURITY INVOKER
LANGUAGE plpgsql
AS
$$
BEGIN
    NEW.qualified_at := current_timestamp;
    RETURN NEW;
END;
$$;

-- changeset flex:service-provider-product-application-status-qualified-trigger runOnChange:true endDelimiter:--
CREATE OR REPLACE TRIGGER service_provider_product_application_status_qualified
BEFORE UPDATE OF status ON service_provider_product_application
FOR EACH ROW
WHEN (
    OLD.status IS DISTINCT FROM NEW.status -- noqa
    AND NEW.status = 'qualified' -- noqa
    AND OLD.qualified_at IS NULL AND NEW.qualified_at IS NULL -- noqa
)
EXECUTE FUNCTION service_provider_product_application_status_qualified();

-- changeset flex:service-provider-product-application-status-remove-notes runOnChange:true endDelimiter:--
ALTER TABLE flex.service_provider_product_application
DROP COLUMN IF EXISTS notes CASCADE;

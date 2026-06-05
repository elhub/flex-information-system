--liquibase formatted sql
-- Manually managed file

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

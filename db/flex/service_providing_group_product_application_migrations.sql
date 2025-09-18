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

-- changeset flex:service-providing-group-product-application-multiple-product-types runOnChange:false endDelimiter:;
--preconditions onFail:MARK_RAN
--precondition-sql-check expectedResult:1 SELECT COUNT(*) FROM information_schema.columns WHERE table_schema = 'flex' AND table_name = 'service_providing_group_product_application' AND column_name = 'product_type_id'
ALTER TABLE flex.service_providing_group_product_application
DISABLE TRIGGER USER;

ALTER TABLE flex.service_providing_group_product_application
ADD COLUMN product_type_ids bigint [];

UPDATE flex.service_providing_group_product_application
SET product_type_ids = ARRAY[product_type_id]
WHERE product_type_ids IS NULL;

ALTER TABLE flex.service_providing_group_product_application
ALTER COLUMN product_type_ids SET NOT NULL;

ALTER TABLE flex.service_providing_group_product_application
ADD CONSTRAINT service_providing_group_product_application_product_type_ids_fkey
CHECK (product_type_ids_exists(product_type_ids));

ALTER TABLE flex.service_providing_group_product_application
DROP COLUMN product_type_id CASCADE;

ALTER TABLE flex.service_providing_group_product_application
ENABLE TRIGGER USER;

ALTER TABLE flex.service_providing_group_product_application_history
ADD COLUMN product_type_ids bigint [];

UPDATE flex.service_providing_group_product_application_history
SET product_type_ids = ARRAY[product_type_id]
WHERE product_type_ids IS NULL;

ALTER TABLE flex.service_providing_group_product_application_history
DROP COLUMN product_type_id CASCADE;

-- changeset flex:service-providing-group-product-application-product-type-insert-function runOnChange:true endDelimiter:--
-- trigger to check that the inserted product types are active for the SO
CREATE OR REPLACE FUNCTION
service_providing_group_product_application_product_type_insert()
RETURNS trigger
SECURITY INVOKER
LANGUAGE plpgsql
AS
$$
DECLARE
    l_pt_id bigint;
BEGIN
    FOR l_pt_id IN SELECT unnest(NEW.product_type_ids) LOOP
        IF NOT EXISTS (
            SELECT 1 FROM system_operator_product_type
            WHERE system_operator_id = NEW.procuring_system_operator_id
            AND product_type_id = l_pt_id
            AND status = 'active'
        ) THEN
            RAISE sqlstate 'PT400' using
                message =
                    'product type ' || (
                        SELECT business_id FROM product_type
                        WHERE id = l_pt_id
                    ) || ' is not active for system operator';
            RETURN null;
        END IF;
    END LOOP;

    RETURN NEW;
END;
$$;

-- changeset flex:service-providing-group-product-application-product-type-insert-trigger runOnChange:true endDelimiter:--
-- SPGPA-VAL002
CREATE OR REPLACE TRIGGER
service_providing_group_product_application_product_type_insert
BEFORE INSERT ON service_providing_group_product_application
FOR EACH ROW
EXECUTE FUNCTION
service_providing_group_product_application_product_type_insert();

-- changeset flex:service-providing-group-product-application-sp-qualified-insert-function runOnChange:true endDelimiter:--
-- trigger to check that the SP inserting the SPGPA was qualified by the SO
-- for these product types
CREATE OR REPLACE FUNCTION
service_providing_group_product_application_sp_qualified_insert()
RETURNS trigger
SECURITY INVOKER
LANGUAGE plpgsql
AS
$$
DECLARE
    l_sp_id bigint;
    l_qualified_pt_ids bigint[];
    l_pt_id bigint;
BEGIN
    SELECT service_provider_id INTO l_sp_id
    FROM service_providing_group
    WHERE id = NEW.service_providing_group_id;

    SELECT array_agg(qpt_id) INTO l_qualified_pt_ids
    FROM (
        SELECT DISTINCT unnest(product_type_ids) AS qpt_id
        FROM service_provider_product_application
        WHERE service_provider_id = l_sp_id
            AND system_operator_id = NEW.procuring_system_operator_id
            AND status = 'qualified'
    ) qpt_ids;

    FOR l_pt_id IN SELECT unnest(NEW.product_type_ids) LOOP
        IF l_pt_id NOT IN (SELECT unnest(l_qualified_pt_ids)) THEN
            RAISE sqlstate 'PT400' using
                message =
                    'service provider is not qualified for product type ' || (
                        SELECT business_id FROM product_type
                        WHERE id = l_pt_id
                    ) || ' for this system operator';
            RETURN null;
        END IF;
    END LOOP;

    RETURN NEW;
END;
$$;

-- changeset flex:service-providing-group-product-application-sp-qualified-insert-trigger runOnChange:true endDelimiter:--
-- SPGPA-VAL003
CREATE OR REPLACE TRIGGER
service_providing_group_product_application_sp_qualified_insert
BEFORE INSERT ON service_providing_group_product_application
FOR EACH ROW
EXECUTE FUNCTION
service_providing_group_product_application_sp_qualified_insert();

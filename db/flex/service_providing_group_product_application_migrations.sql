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

-- changeset flex:service-providing-group-product-application-clean-status-timestamp-triggers runOnChange:true endDelimiter:;
DROP TRIGGER IF EXISTS
service_providing_group_product_application_check_timestamp_on_status_update
ON service_providing_group_product_application;

DROP TRIGGER IF EXISTS
service_providing_group_product_application_status_prequalified
ON service_providing_group_product_application;
DROP FUNCTION IF EXISTS
service_providing_group_product_application_status_prequalified;

DROP TRIGGER IF EXISTS
service_providing_group_product_application_status_verified
ON service_providing_group_product_application;
DROP FUNCTION IF EXISTS
service_providing_group_product_application_status_verified;

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
-- trigger to check that the upserted product types are active for the SO
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
BEFORE INSERT OR UPDATE ON service_providing_group_product_application
FOR EACH ROW
EXECUTE FUNCTION
service_providing_group_product_application_product_type_insert();

-- changeset flex:service-providing-group-product-application-sp-qualified-insert-function runOnChange:true endDelimiter:--
-- trigger to check that the SP upserting the SPGPA was qualified by the SO
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
BEFORE INSERT OR UPDATE ON service_providing_group_product_application
FOR EACH ROW
EXECUTE FUNCTION
service_providing_group_product_application_sp_qualified_insert();

-- changeset flex:service-providing-group-product-application-rename-notes runOnChange:false endDelimiter:;
--preconditions onFail:MARK_RAN
--precondition-sql-check expectedResult:1 SELECT COUNT(*) FROM information_schema.columns WHERE table_schema = 'flex' AND table_name = 'service_providing_group_product_application' AND column_name = 'notes'
ALTER TABLE flex.service_providing_group_product_application
DROP CONSTRAINT service_providing_group_product_application_notes_check;
ALTER TABLE flex.service_providing_group_product_application
RENAME COLUMN notes TO additional_information;
ALTER TABLE flex.service_providing_group_product_application_history
RENAME COLUMN notes TO additional_information;
ALTER TABLE flex.service_providing_group_product_application
ADD CONSTRAINT spg_product_application_additional_information_check CHECK (
    char_length(additional_information) <= 512
);

-- changeset flex:service-providing-group-product-application-maximum-active-power runOnChange:false endDelimiter:;
--preconditions onFail:MARK_RAN
--precondition-sql-check expectedResult:0 SELECT COUNT(*) FROM information_schema.columns WHERE table_schema = 'flex' AND table_name = 'service_providing_group_product_application' AND column_name = 'maximum_active_power'
ALTER TABLE flex.service_providing_group_product_application
DISABLE TRIGGER USER;

ALTER TABLE flex.service_providing_group_product_application
ADD COLUMN IF NOT EXISTS maximum_active_power decimal(9, 3);

ALTER TABLE flex.service_providing_group_product_application_history
ADD COLUMN IF NOT EXISTS maximum_active_power decimal(9, 3);

UPDATE flex.service_providing_group_product_application
SET maximum_active_power = 0
WHERE maximum_active_power IS NULL;

UPDATE flex.service_providing_group_product_application_history
SET maximum_active_power = 0
WHERE maximum_active_power IS NULL;

ALTER TABLE flex.service_providing_group_product_application
ALTER COLUMN maximum_active_power SET NOT NULL;

ALTER TABLE flex.service_providing_group_product_application
ADD CONSTRAINT spg_product_application_maximum_active_power_check CHECK (
    maximum_active_power >= 0
);

ALTER TABLE flex.service_providing_group_product_application
ENABLE TRIGGER USER;

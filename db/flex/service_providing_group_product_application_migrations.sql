--liquibase formatted sql
-- Manually managed file

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
-- trigger to check that the SP upserting the SPGPA is (being) qualified by the
-- SO for these product types
CREATE OR REPLACE FUNCTION
service_providing_group_product_application_sp_qualified_insert()
RETURNS trigger
SECURITY INVOKER
LANGUAGE plpgsql
AS
$$
DECLARE
    l_sp_id bigint;
    l_qualifying_pt_ids bigint[];
    l_pt_id bigint;
BEGIN
    SELECT service_provider_id INTO l_sp_id
    FROM service_providing_group
    WHERE id = NEW.service_providing_group_id;

    SELECT COALESCE(array_agg(qpt_id), '{}'::bigint[]) INTO l_qualifying_pt_ids
    FROM (
        SELECT DISTINCT unnest(product_type_ids) AS qpt_id
        FROM service_provider_product_application
        WHERE service_provider_id = l_sp_id
            AND system_operator_id = NEW.procuring_system_operator_id
            AND status != 'not_qualified'
    ) qpt_ids;

    FOR l_pt_id IN SELECT unnest(NEW.product_type_ids) LOOP
        IF l_pt_id NOT IN (SELECT unnest(l_qualifying_pt_ids)) THEN
            RAISE sqlstate 'PT400' using
                message =
                    'service provider has no ongoing qualification for product type ' || (
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

-- changeset flex:spgpa-add-ramping-columns runOnChange:true endDelimiter:;
ALTER TABLE flex.service_providing_group_product_application
ADD COLUMN IF NOT EXISTS ramping_capability text NULL
CONSTRAINT spg_product_application_ramping_capability_check
CHECK (ramping_capability IN ('always', 'partial', 'never'));

ALTER TABLE flex.service_providing_group_product_application_history
ADD COLUMN IF NOT EXISTS ramping_capability text NULL;

ALTER TABLE flex.service_providing_group_product_application
ADD COLUMN IF NOT EXISTS ramping_description text NULL;

ALTER TABLE flex.service_providing_group_product_application_history
ADD COLUMN IF NOT EXISTS ramping_description text NULL;

UPDATE flex.service_providing_group_product_application
SET
    ramping_capability = 'always',
    ramping_description = 'default ramping description'
WHERE (
    ramping_capability IS NULL OR ramping_description IS NULL
) AND 1 = any(product_type_ids);

-- SPGPA-VAL007
ALTER TABLE flex.service_providing_group_product_application
ADD CONSTRAINT spg_product_application_ramping_capability_required_check CHECK (
    ramping_capability IS NOT NULL
    OR NOT (1 = any(product_type_ids))
);

-- SPGPA-VAL008
ALTER TABLE flex.service_providing_group_product_application
ADD CONSTRAINT spg_product_application_ramping_description_check CHECK (
    ramping_description IS NOT NULL
    OR NOT (1 = any(product_type_ids))
);

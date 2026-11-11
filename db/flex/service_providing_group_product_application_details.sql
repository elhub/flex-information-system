--liquibase formatted sql
-- Manually managed file
--
-- Product-specific details of a service providing group product application:
-- application_details (written by the SP) and assessment_details (written by
-- the procuring SO). The variants are defined in the OpenAPI specification, and
-- the fields of the details are validated by the write endpoints of the Kotlin
-- backend. The database checks the structure only: which product types have
-- details, and that the kind of the details is the product type.
-- The table flex.product_variant is generated from the OpenAPI specification.

-- changeset flex:spgpa-details-columns runOnChange:false endDelimiter:;
ALTER TABLE flex.service_providing_group_product_application
ADD COLUMN IF NOT EXISTS application_details jsonb NULL;

ALTER TABLE flex.service_providing_group_product_application_history
ADD COLUMN IF NOT EXISTS application_details jsonb NULL;

ALTER TABLE flex.service_providing_group_product_application
ADD COLUMN IF NOT EXISTS assessment_details jsonb NULL;

ALTER TABLE flex.service_providing_group_product_application_history
ADD COLUMN IF NOT EXISTS assessment_details jsonb NULL;

-- the legacy (mFRR) columns are deprecated and replaced by application_details
ALTER TABLE flex.service_providing_group_product_application
ALTER COLUMN maximum_active_power_up DROP NOT NULL;

ALTER TABLE flex.service_providing_group_product_application_history
ALTER COLUMN maximum_active_power_up DROP NOT NULL;

ALTER TABLE flex.service_providing_group_product_application
ALTER COLUMN maximum_active_power_down DROP NOT NULL;

ALTER TABLE flex.service_providing_group_product_application_history
ALTER COLUMN maximum_active_power_down DROP NOT NULL;

-- changeset flex:spgpa-details-backfill runOnChange:false endDelimiter:;
SELECT public.disable_triggers();

UPDATE flex.service_providing_group_product_application
SET
    application_details = jsonb_strip_nulls(jsonb_build_object(
        'kind', 'manual_frequency_restoration',
        'maximum_active_power_up', maximum_active_power_up,
        'maximum_active_power_down', maximum_active_power_down,
        'ramping_capability', ramping_capability,
        'ramping_description', ramping_description,
        'additional_information', additional_information
    ))
WHERE application_details IS NULL
    AND product_type_ids = array(
        SELECT id FROM flex.product_type
        WHERE business_id = 'manual_frequency_restoration'
    );

UPDATE flex.service_providing_group_product_application_history
SET
    application_details = jsonb_strip_nulls(jsonb_build_object(
        'kind', 'manual_frequency_restoration',
        'maximum_active_power_up', maximum_active_power_up,
        'maximum_active_power_down', maximum_active_power_down,
        'ramping_capability', ramping_capability,
        'ramping_description', ramping_description,
        'additional_information', additional_information
    ))
WHERE application_details IS NULL
    AND product_type_ids = array(
        SELECT id FROM flex.product_type
        WHERE business_id = 'manual_frequency_restoration'
    );

SELECT public.enable_triggers();

-- changeset flex:spgpa-details-backfill-report runOnChange:false endDelimiter:--
-- applications that are not mFRR keep their legacy values only in the
-- legacy columns, and applications with several product types are not
-- validated until they are updated
DO
$$
DECLARE
    l_not_mfrr bigint;
    l_multiple bigint;
BEGIN
    SELECT count(*) INTO l_not_mfrr
    FROM flex.service_providing_group_product_application
    WHERE application_details IS NULL
        AND (
            maximum_active_power_up IS NOT NULL
            OR maximum_active_power_down IS NOT NULL
            OR ramping_capability IS NOT NULL
            OR ramping_description IS NOT NULL
            OR additional_information IS NOT NULL
        );

    SELECT count(*) INTO l_multiple
    FROM flex.service_providing_group_product_application
    WHERE cardinality(product_type_ids) <> 1;

    RAISE NOTICE 'SPGPA details: % application(s) not for mFRR have values in the legacy columns', l_not_mfrr;
    RAISE NOTICE 'SPGPA details: % application(s) do not have exactly one product type', l_multiple;
END;
$$;

-- changeset flex:spgpa-details-validate-function runOnChange:true endDelimiter:--
-- SPGPA-VAL012: exactly one product type
-- SPGPA-VAL013: application and assessment details have the kind of the
-- product type, and exist only for product types with a variant
CREATE OR REPLACE FUNCTION flex.spgpa_validate_details()
RETURNS trigger
SECURITY DEFINER
LANGUAGE plpgsql
AS
$$
DECLARE
    l_kind text;
    l_has_application boolean;
    l_has_assessment boolean;
    l_pt_changed boolean;
BEGIN
    l_pt_changed := TG_OP = 'INSERT'
        OR NEW.product_type_ids IS DISTINCT FROM OLD.product_type_ids;

    -- old rows are only validated when the relevant fields are changed
    IF (
        NOT l_pt_changed
        AND NEW.application_details IS NOT DISTINCT FROM OLD.application_details
        AND NEW.assessment_details IS NOT DISTINCT FROM OLD.assessment_details
    ) THEN
        RETURN NEW;
    END IF;

    IF l_pt_changed AND cardinality(NEW.product_type_ids) <> 1 THEN
        RAISE sqlstate 'PT400' USING
            message = 'product_type_ids must contain exactly one product type';
    END IF;

    SELECT
        pt.business_id,
        pv.application_variant IS NOT NULL,
        pv.assessment_variant IS NOT NULL
    INTO l_kind, l_has_application, l_has_assessment
    FROM flex.product_type AS pt
    LEFT JOIN flex.product_variant AS pv ON pt.business_id = pv.kind
    WHERE pt.id = NEW.product_type_ids[1];

    l_has_application := coalesce(l_has_application, false);
    l_has_assessment := coalesce(l_has_assessment, false);

    IF l_pt_changed
        OR NEW.application_details IS DISTINCT FROM OLD.application_details
    THEN
        IF NOT l_has_application THEN
            IF NEW.application_details IS NOT NULL THEN
                RAISE sqlstate 'PT400' USING message = format(
                    'application_details is not allowed for kind %s', l_kind
                );
            END IF;
        ELSIF NEW.application_details IS NULL THEN
            RAISE sqlstate 'PT400' USING
                message = 'application_details is required';
        ELSIF NEW.application_details ->> 'kind' IS DISTINCT FROM l_kind THEN
            RAISE sqlstate 'PT400' USING message = format(
                'application_details.kind must be %s', l_kind
            );
        END IF;
    END IF;

    IF NEW.assessment_details IS NOT NULL AND (
        l_pt_changed
        OR NEW.assessment_details IS DISTINCT FROM OLD.assessment_details
    ) THEN
        IF NOT l_has_assessment THEN
            RAISE sqlstate 'PT400' USING message = format(
                'assessment_details is not allowed for kind %s', l_kind
            );
        ELSIF NEW.assessment_details ->> 'kind' IS DISTINCT FROM l_kind THEN
            RAISE sqlstate 'PT400' USING message = format(
                'assessment_details.kind must be %s', l_kind
            );
        END IF;
    END IF;

    RETURN NEW;
END;
$$;

-- changeset flex:spgpa-details-triggers runOnChange:true endDelimiter:--
DROP TRIGGER IF EXISTS spgpa_details_1_legacy_to_details
ON flex.service_providing_group_product_application;
DROP TRIGGER IF EXISTS spgpa_details_3_details_to_legacy
ON flex.service_providing_group_product_application;
DROP TRIGGER IF EXISTS spgpa_details_2_validate
ON flex.service_providing_group_product_application;
DROP FUNCTION IF EXISTS flex.spgpa_legacy_to_details();
DROP FUNCTION IF EXISTS flex.spgpa_details_to_legacy();
DROP FUNCTION IF EXISTS flex.json_object_errors(text, jsonb, jsonb);

CREATE OR REPLACE TRIGGER spgpa_validate_details
BEFORE INSERT OR UPDATE ON flex.service_providing_group_product_application
FOR EACH ROW
EXECUTE FUNCTION flex.spgpa_validate_details();

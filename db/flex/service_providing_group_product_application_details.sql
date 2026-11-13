--liquibase formatted sql
-- Manually managed file
--
-- Product-specific details of a service providing group product application:
-- application_details (written by the SP) and assessment_details (written by
-- the procuring SO). The variants are defined in the OpenAPI specification, and
-- the details are validated by the write endpoints of the Kotlin backend.

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

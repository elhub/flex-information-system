--liquibase formatted sql
-- GENERATED CODE -- DO NOT EDIT (scripts/openapi_to_db.py)
-- noqa: disable=all

-- changeset flex:product-variant-create runOnChange:true endDelimiter:--
CREATE TABLE IF NOT EXISTS flex.product_variant (
    kind text PRIMARY KEY,
    application_variant text NULL,
    assessment_variant text NULL
);

-- changeset flex:product-variant-data runOnChange:true endDelimiter:--
DELETE FROM flex.product_variant;

INSERT INTO flex.product_variant (
    kind, application_variant, assessment_variant
) VALUES
    ('manual_frequency_restoration', 'spgpa_application_details_mfrr', NULL),
    ('automatic_frequency_containment', 'spgpa_application_details_fcr_n', 'spgpa_assessment_details_fcr_n'),
    ('automatic_frequency_containment_disturbance', 'spgpa_application_details_fcr_d', 'spgpa_assessment_details_fcr_d');

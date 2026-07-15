--liquibase formatted sql
-- GENERATED CODE -- DO NOT EDIT (scripts/openapi_to_db.py)

-- changeset flex:service-providing-group-product-application-attachment-create runOnChange:true endDelimiter:--
CREATE TABLE IF NOT EXISTS
flex.service_providing_group_product_application_attachment (
    id bigint PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
    service_providing_group_product_application_id bigint NOT NULL,
    attachment_id bigint NOT NULL,
    record_time_range tstzrange NOT NULL DEFAULT tstzrange(
        localtimestamp, null, '[)'
    ),
    recorded_by bigint NOT NULL DEFAULT current_identity(),

    CONSTRAINT spgpaa_spgpa_fkey
    FOREIGN KEY (service_providing_group_product_application_id)
    REFERENCES service_providing_group_product_application (id),
    CONSTRAINT spgpaa_attachment_fkey
    FOREIGN KEY (attachment_id)
    REFERENCES attachment (id)
);

-- changeset flex:service-providing-group-product-application-attachment-capture-event runOnChange:true endDelimiter:--
CREATE OR REPLACE TRIGGER
service_providing_group_product_application_attachment_event
AFTER INSERT OR DELETE
ON service_providing_group_product_application_attachment
FOR EACH ROW
EXECUTE FUNCTION
capture_event('service_providing_group_product_application');

--liquibase formatted sql
-- Manually managed file

-- changeset flex:service-providing-group-product-application-attachment-create runOnChange:true endDelimiter:--
CREATE TABLE IF NOT EXISTS
service_providing_group_product_application_attachment (
    id bigint PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
    service_providing_group_product_application_id bigint NOT NULL,
    object_id text NOT NULL,
    name text NOT NULL,
    content_type text NOT NULL DEFAULT 'application/pdf',
    size_bytes bigint NOT NULL,
    record_time_range tstzrange NOT NULL DEFAULT tstzrange(
        localtimestamp, null, '[)'
    ),
    recorded_by bigint NOT NULL DEFAULT current_identity(),

    CONSTRAINT spgpaa_object_id_unique UNIQUE (object_id),
    CONSTRAINT spgpaa_content_type_check CHECK (
        content_type IN ('application/pdf')
    ),
    CONSTRAINT spgpaa_size_bytes_check CHECK (size_bytes > 0),
    CONSTRAINT spgpaa_name_check CHECK (
        char_length(name) >= 1
        AND char_length(name) <= 256
    ),
    CONSTRAINT spgpaa_spgpa_fkey
    FOREIGN KEY (service_providing_group_product_application_id)
    REFERENCES service_providing_group_product_application (id)
);

-- changeset flex:service-providing-group-product-application-attachment-capture-event runOnChange:true endDelimiter:--
CREATE OR REPLACE TRIGGER
service_providing_group_product_application_attachment_event
AFTER INSERT OR DELETE
ON service_providing_group_product_application_attachment
FOR EACH ROW
EXECUTE FUNCTION
capture_event('service_providing_group_product_application');

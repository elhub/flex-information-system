--liquibase formatted sql
-- Manually managed file

-- changeset flex:service-provider-product-application-comment-create runOnChange:false endDelimiter:--
CREATE TABLE IF NOT EXISTS service_provider_product_application_comment (
    id bigint PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
    service_provider_product_application_id bigint NOT NULL,
    visibility text NOT NULL DEFAULT 'same_party' CHECK (
        visibility IN (
            'same_party',
            'same_party_type',
            'any_party'
        )
    ),
    content text NULL CHECK (
        char_length(content) <= 2048
    ),
    created_by bigint NOT NULL DEFAULT current_identity(),
    created_at timestamp with time zone NOT NULL DEFAULT current_timestamp,
    record_time_range tstzrange NOT NULL DEFAULT tstzrange(
        localtimestamp, null, '[)'
    ),
    recorded_by bigint NOT NULL DEFAULT current_identity(),

    CONSTRAINT service_provider_product_application_comment_sppa_fkey
    FOREIGN KEY (service_provider_product_application_id)
    REFERENCES service_provider_product_application (id)
);

-- changeset flex:service-provider-product-application-comment-capture-event runOnChange:true endDelimiter:--
CREATE OR REPLACE TRIGGER service_provider_product_application_comment_event
AFTER INSERT OR UPDATE ON service_provider_product_application_comment
FOR EACH ROW
EXECUTE FUNCTION capture_event('service_provider_product_application_comment');

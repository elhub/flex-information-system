--liquibase formatted sql
-- GENERATED CODE -- DO NOT EDIT (scripts/openapi_to_db.py)

-- changeset flex:service-provider-product-suspension-comment-create runOnChange:true endDelimiter:--
CREATE TABLE IF NOT EXISTS service_provider_product_suspension_comment (
    id bigint PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
    service_provider_product_suspension_id bigint NOT NULL,
    visibility text NOT NULL DEFAULT 'same_party',
    content text NULL CHECK (
        char_length(content) <= 2048
    ),
    created_by bigint NOT NULL DEFAULT current_identity(),
    created_at timestamp with time zone NOT NULL DEFAULT current_timestamp,
    record_time_range tstzrange NOT NULL DEFAULT tstzrange(
        localtimestamp, null, '[)'
    ),
    recorded_by bigint NOT NULL DEFAULT current_identity(),

    CONSTRAINT
    service_provider_product_suspension_comment_visibility_check
    CHECK (
        visibility IN (
            'same_party',
            'any_involved_party'
        )
    ),
    CONSTRAINT
    service_provider_product_suspension_comment_spps_fkey
    FOREIGN KEY (service_provider_product_suspension_id)
    REFERENCES service_provider_product_suspension (id)
    ON DELETE CASCADE
);

-- changeset flex:service-provider-product-suspension-comment-capture-event runOnChange:true endDelimiter:--
CREATE OR REPLACE TRIGGER
service_provider_product_suspension_comment_event
AFTER INSERT OR UPDATE
ON service_provider_product_suspension_comment
FOR EACH ROW
EXECUTE FUNCTION
capture_event('service_provider_product_suspension_comment');

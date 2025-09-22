--liquibase formatted sql
-- Manually managed file

-- changeset flex:service-provider-product-suspension-comment-create runOnChange:false endDelimiter:--
CREATE TABLE IF NOT EXISTS service_provider_product_suspension_comment (
    id bigint PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
    service_provider_product_suspension_id bigint NOT NULL,
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

    CONSTRAINT service_provider_product_suspension_comment_sppa_fkey
    FOREIGN KEY (service_provider_product_suspension_id)
    REFERENCES service_provider_product_suspension (id)
);

-- changeset flex:service-provider-product-suspension-comment-capture-event runOnChange:true endDelimiter:--
CREATE OR REPLACE TRIGGER service_provider_product_suspension_comment_event
AFTER INSERT OR UPDATE ON service_provider_product_suspension_comment
FOR EACH ROW
EXECUTE FUNCTION capture_event('service_provider_product_suspension_comment');

-- changeset flex:service-provider-product-suspension-clear-comments-before-delete-function runOnChange:true endDelimiter:--
CREATE OR REPLACE FUNCTION
service_provider_product_suspension_clear_comments_before_delete()
RETURNS trigger
-- DEFINER because the user deleting the SPPS did not necessarily have the right
-- to delete all comments linked to the suspension while it was still active
SECURITY DEFINER
LANGUAGE plpgsql
AS
$$
BEGIN
    DELETE FROM flex.service_provider_product_suspension_comment
    WHERE service_provider_product_suspension_id = OLD.id;

    RETURN OLD;
END;
$$;

-- changeset flex:service-provider-product-suspension-clear-comments-before-delete-trigger runOnChange:true endDelimiter:--
CREATE OR REPLACE TRIGGER
service_provider_product_suspension_clear_comments_before_delete
BEFORE DELETE ON service_provider_product_suspension
FOR EACH ROW
EXECUTE FUNCTION
service_provider_product_suspension_clear_comments_before_delete();

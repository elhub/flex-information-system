--liquibase formatted sql
-- Manually managed file
-- noqa: disable=RF04,ST06
-- RF04 - Keywords should not be used as identifiers.
-- ST06 - Select wildcards then simple targets before calculations and aggregates.

-- changeset flex:api-service-providing-group-product-application-attachment-create endDelimiter:-- runOnChange:true
CREATE OR REPLACE VIEW
api.service_providing_group_product_application_attachment
WITH (security_invoker = true) AS (
    SELECT
        spgpaa.id,
        spgpaa.recorded_by,
        lower(spgpaa.record_time_range) AS recorded_at,
        spgpaa.service_providing_group_product_application_id,
        att.object_id,
        att.filename,
        att.filename_sanitised,
        att.content_type,
        att.size_bytes
    FROM flex.service_providing_group_product_application_attachment AS spgpaa
        INNER JOIN flex.attachment AS att
            ON spgpaa.attachment_id = att.id
);

-- changeset flex:api-service-providing-group-product-application-attachment-stateful-operation-function endDelimiter:-- runOnChange:true
CREATE OR REPLACE FUNCTION
spgpa_attachment_stateful_operation()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
DECLARE
    l_attachment_id bigint;
    l_link_id bigint;
    l_link_record_time_range tstzrange;
    l_link_recorded_by bigint;
BEGIN
    IF (TG_OP = 'INSERT') THEN
        -- first create the attachment
        INSERT INTO flex.attachment (
            object_id,
            filename,
            filename_sanitised,
            content_type,
            size_bytes
        ) VALUES (
            NEW.object_id,
            NEW.filename,
            NEW.filename_sanitised,
            NEW.content_type,
            NEW.size_bytes
        ) RETURNING id INTO l_attachment_id;

        -- then the link
        INSERT INTO flex.service_providing_group_product_application_attachment (
            service_providing_group_product_application_id,
            attachment_id
        ) VALUES (
            NEW.service_providing_group_product_application_id,
            l_attachment_id
        ) RETURNING id, record_time_range, recorded_by
        INTO l_link_id, l_link_record_time_range, l_link_recorded_by;

        -- enrich the returned record so it matches the view definition
        NEW.id := l_link_id;
        NEW.recorded_at := lower(l_link_record_time_range);
        NEW.recorded_by := l_link_recorded_by;

        RETURN NEW;
    ELSIF (TG_OP = 'DELETE') THEN
        -- first delete the link, getting the attachment ID
        DELETE FROM flex.service_providing_group_product_application_attachment
        WHERE id = OLD.id
        RETURNING attachment_id INTO l_attachment_id;

        -- then delete the attachment
        DELETE FROM flex.attachment
        WHERE id = l_attachment_id;

        RETURN OLD;
    ELSE
        RAISE EXCEPTION 'Unsupported operation: %', TG_OP;
    END IF;
END;
$$;

-- changeset flex:api-service-providing-group-product-application-attachment-stateful-operation-trigger endDelimiter:-- runOnChange:true
CREATE TRIGGER spgpa_attachment_stateful_operation_trigger
INSTEAD OF INSERT OR DELETE
ON api.service_providing_group_product_application_attachment
FOR EACH ROW EXECUTE FUNCTION
spgpa_attachment_stateful_operation();

-- changeset flex:api-service-providing-group-product-application-attachment-can-edit-function endDelimiter:-- runOnChange:true
CREATE OR REPLACE FUNCTION
api.service_providing_group_product_application_attachment_can_edit(
    in_service_providing_group_product_application_id BIGINT
)
RETURNS BOOLEAN
LANGUAGE sql
AS $$
SELECT EXISTS (
    SELECT 1
    FROM flex.service_providing_group_product_application_involved_parties
        AS spgpa_ip
    WHERE spgpa_ip.service_providing_group_product_application_id
    = in_service_providing_group_product_application_id
        AND spgpa_ip.party_id = (SELECT flex.current_party())
);
$$;

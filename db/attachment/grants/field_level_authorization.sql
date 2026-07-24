-- liquibase formatted sql
-- AUTO-GENERATED FILE (just permissions-to-db)

-- changeset flex:attachment-field-level-authorization runOnChange:true

GRANT SELECT (
    id,
    service_providing_group_product_application_id,
    object_id,
    filename,
    filename_sanitised,
    content_type,
    size_bytes,
    recorded_at,
    recorded_by
) ON TABLE
attachment.service_providing_group_product_application_attachment
TO flex_balance_responsible_party;

GRANT SELECT (
    id,
    service_providing_group_product_application_id,
    object_id,
    filename,
    filename_sanitised,
    content_type,
    size_bytes,
    recorded_at,
    recorded_by
) ON TABLE
attachment.service_providing_group_product_application_attachment
TO flex_energy_supplier;

GRANT SELECT (
    id,
    service_providing_group_product_application_id,
    object_id,
    filename,
    filename_sanitised,
    content_type,
    size_bytes,
    recorded_at,
    recorded_by
) ON TABLE
attachment.service_providing_group_product_application_attachment
TO flex_end_user;

GRANT INSERT (
    service_providing_group_product_application_id,
    object_id,
    filename,
    filename_sanitised,
    content_type,
    size_bytes
) ON TABLE
attachment.service_providing_group_product_application_attachment
TO flex_flexibility_information_system_operator;

GRANT SELECT (
    id,
    service_providing_group_product_application_id,
    object_id,
    filename,
    filename_sanitised,
    content_type,
    size_bytes,
    recorded_at,
    recorded_by
) ON TABLE
attachment.service_providing_group_product_application_attachment
TO flex_flexibility_information_system_operator;

GRANT DELETE ON TABLE
attachment.service_providing_group_product_application_attachment
TO flex_flexibility_information_system_operator;

GRANT SELECT (
    id,
    service_providing_group_product_application_id,
    object_id,
    filename,
    filename_sanitised,
    content_type,
    size_bytes,
    recorded_at,
    recorded_by
) ON TABLE
attachment.service_providing_group_product_application_attachment
TO flex_market_operator;

GRANT SELECT (
    id,
    service_providing_group_product_application_id,
    object_id,
    filename,
    filename_sanitised,
    content_type,
    size_bytes,
    recorded_at,
    recorded_by
) ON TABLE
attachment.service_providing_group_product_application_attachment
TO flex_system_operator;

GRANT INSERT (
    service_providing_group_product_application_id,
    object_id,
    filename,
    filename_sanitised,
    content_type,
    size_bytes
) ON TABLE
attachment.service_providing_group_product_application_attachment
TO flex_service_provider;

GRANT SELECT (
    id,
    service_providing_group_product_application_id,
    object_id,
    filename,
    filename_sanitised,
    content_type,
    size_bytes,
    recorded_at,
    recorded_by
) ON TABLE
attachment.service_providing_group_product_application_attachment
TO flex_service_provider;

GRANT DELETE ON TABLE
attachment.service_providing_group_product_application_attachment
TO flex_service_provider;

GRANT SELECT (
    id,
    service_providing_group_product_application_id,
    object_id,
    filename,
    filename_sanitised,
    content_type,
    size_bytes,
    recorded_at,
    recorded_by
) ON TABLE
attachment.service_providing_group_product_application_attachment
TO flex_third_party;

GRANT SELECT ON TABLE
attachment.service_providing_group_product_application_attachment
TO flex_internal_event_notification;

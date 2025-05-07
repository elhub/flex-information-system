--liquibase formatted sql
-- Manually managed file


-- changeset flex:party-of-identity runOnChange:true endDelimiter:--
-- utility function to reduce joins in the policies below
CREATE OR REPLACE FUNCTION party_of_identity(_identity bigint)
RETURNS bigint
SECURITY DEFINER
LANGUAGE sql
AS $$
  SELECT party_id FROM flex.identity WHERE id = _identity;
$$;

-- changeset flex:service-provider-product-application-comment-rls runOnChange:true endDelimiter:;
ALTER TABLE IF EXISTS service_provider_product_application_comment
ENABLE ROW LEVEL SECURITY;

-- internal
GRANT SELECT ON service_provider_product_application_comment
TO flex_internal_event_notification;
CREATE POLICY "SPPAC_INTERNAL_EVENT_NOTIFICATION"
ON service_provider_product_application_comment
FOR SELECT
TO flex_internal_event_notification
USING (true);

GRANT SELECT, INSERT, UPDATE
ON service_provider_product_application_comment
TO flex_common;

-- RLS: SPPAC-COM002
CREATE POLICY "SPPAC_COM002"
ON service_provider_product_application_comment
FOR UPDATE
TO flex_common
USING (created_by = flex.current_identity());

-- RLS: SPPAC-COM003
CREATE POLICY "SPPAC_COM003"
ON service_provider_product_application_comment
FOR INSERT
TO flex_common
WITH CHECK (
    flex.current_party() IN (
        SELECT unnest(ARRAY[sppa.system_operator_id, sppa.service_provider_id])
        FROM service_provider_product_application AS sppa
        WHERE sppa.id = service_provider_product_application_comment.service_provider_product_application_id -- noqa
    )
);

-- RLS: SPPAC-SO001
-- RLS: SPPAC-SP001
CREATE POLICY "SPPAC_SO001_SP001"
ON service_provider_product_application_comment
FOR SELECT
TO flex_common
USING (
    visibility = 'same_party' AND (
        party_of_identity(
            service_provider_product_application_comment.created_by
        ) = flex.current_party()
    )
    OR visibility = 'same_party_type' AND (
        -- check current party and created_by party are of the same type
        SELECT count(DISTINCT p.type) = 1
        FROM party AS p
        WHERE p.id IN (
                flex.current_party(),
                party_of_identity(
                    service_provider_product_application_comment.created_by -- noqa
                )
            )
    )
    OR visibility = 'any_party' -- no check there
);

-- RLS: SPPAC-FISO001
CREATE POLICY "SPPAC_FISO001"
ON service_provider_product_application_comment
FOR ALL
TO flex_flexibility_information_system_operator
USING (true);

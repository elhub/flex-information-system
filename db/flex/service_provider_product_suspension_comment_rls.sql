--liquibase formatted sql
-- Manually managed file

-- changeset flex:service-provider-product-suspension-comment-rls runAlways:true endDelimiter:;
ALTER TABLE IF EXISTS service_provider_product_suspension_comment
ENABLE ROW LEVEL SECURITY;

-- internal
GRANT SELECT ON service_provider_product_suspension_comment
TO flex_internal_event_notification;
CREATE POLICY "SPPSC_INTERNAL_EVENT_NOTIFICATION"
ON service_provider_product_suspension_comment
FOR SELECT
TO flex_internal_event_notification
USING (true);

GRANT SELECT, INSERT, UPDATE
ON service_provider_product_suspension_comment
TO flex_common;

-- RLS: SPPSC-COM001
CREATE POLICY "SPPSC_COM001"
ON service_provider_product_suspension_comment
FOR UPDATE
TO flex_common
USING (created_by = (SELECT flex.current_identity()));

-- RLS: SPPSC-SO001
CREATE POLICY "SPPSC_SO001"
ON service_provider_product_suspension_comment
FOR INSERT
TO flex_system_operator
WITH CHECK (
    EXISTS (
        SELECT 1 FROM flex.service_provider_product_suspension AS spps
        WHERE spps.id = service_provider_product_suspension_comment.service_provider_product_suspension_id -- noqa
            AND spps.procuring_system_operator_id
            = (SELECT flex.current_party())
    )
);

-- RLS: SPPSC-SO002
CREATE POLICY "SPPSC_SO002"
ON service_provider_product_suspension_comment
FOR SELECT
TO flex_system_operator
USING (
    EXISTS (
        SELECT 1
        FROM flex.service_provider_product_suspension AS spps
            INNER JOIN flex.identity AS comment_creator
                ON service_provider_product_suspension_comment.created_by -- noqa
                    = comment_creator.id
            INNER JOIN flex.party AS comment_creator_party
                ON comment_creator.party_id = comment_creator_party.id
            INNER JOIN flex.party AS current_party
                ON current_party.id = (SELECT flex.current_party())
        WHERE spps.id = service_provider_product_suspension_comment.service_provider_product_suspension_id -- noqa
            AND spps.procuring_system_operator_id = current_party.id
            AND ((
                service_provider_product_suspension_comment.visibility = 'same_party' -- noqa
                AND comment_creator.party_id = current_party.id -- noqa
            ) OR (
                service_provider_product_suspension_comment.visibility = 'same_party_type' -- noqa
                AND current_party.type = comment_creator_party.type
            ) OR service_provider_product_suspension_comment.visibility = 'any_party') -- no check there -- noqa
    )
);

-- RLS: SPPSC-SO003
GRANT SELECT ON service_provider_product_suspension_comment_history
TO flex_system_operator;
CREATE POLICY "SPPSC_SO003"
ON service_provider_product_suspension_comment_history
FOR SELECT
TO flex_system_operator
USING (
    EXISTS (
        SELECT 1
        FROM flex.service_provider_product_suspension_history AS sppsh
            INNER JOIN flex.identity AS comment_creator
                ON service_provider_product_suspension_comment_history.created_by -- noqa
                    = comment_creator.id
            INNER JOIN flex.party AS comment_creator_party
                ON comment_creator.party_id = comment_creator_party.id
            INNER JOIN flex.party AS current_party
                ON current_party.id = (SELECT flex.current_party())
        WHERE sppsh.id = service_provider_product_suspension_comment_history.service_provider_product_suspension_id -- noqa
            AND sppsh.procuring_system_operator_id = current_party.id
            AND ((
                service_provider_product_suspension_comment_history.visibility = 'same_party' -- noqa
                AND comment_creator.party_id = current_party.id -- noqa
            ) OR (
                service_provider_product_suspension_comment_history.visibility = 'same_party_type' -- noqa
                AND current_party.type = comment_creator_party.type
            ) OR service_provider_product_suspension_comment_history.visibility = 'any_party') -- no check there -- noqa
    )
);

-- RLS: SPPSC-SP001
CREATE POLICY "SPPSC_SP001"
ON service_provider_product_suspension_comment
FOR INSERT
TO flex_service_provider
WITH CHECK (
    EXISTS (
        SELECT 1 FROM flex.service_provider_product_suspension AS spps
        WHERE spps.id = service_provider_product_suspension_comment.service_provider_product_suspension_id -- noqa
            AND spps.service_provider_id = (SELECT flex.current_party())
    )
);

-- RLS: SPPSC-SP002
CREATE POLICY "SPPSC_SP002"
ON service_provider_product_suspension_comment
FOR SELECT
TO flex_service_provider
USING (
    EXISTS (
        SELECT 1
        FROM flex.service_provider_product_suspension AS spps
            INNER JOIN flex.identity AS comment_creator
                ON service_provider_product_suspension_comment.created_by -- noqa
                    = comment_creator.id
            INNER JOIN flex.party AS comment_creator_party
                ON comment_creator.party_id = comment_creator_party.id
            INNER JOIN flex.party AS current_party
                ON current_party.id = (SELECT flex.current_party())
        WHERE spps.id = service_provider_product_suspension_comment.service_provider_product_suspension_id -- noqa
            AND spps.service_provider_id = current_party.id
            AND ((
                service_provider_product_suspension_comment.visibility = 'same_party' -- noqa
                AND comment_creator.party_id = current_party.id -- noqa
            ) OR (
                service_provider_product_suspension_comment.visibility = 'same_party_type' -- noqa
                AND current_party.type = comment_creator_party.type
            ) OR service_provider_product_suspension_comment.visibility = 'any_party') -- no check there -- noqa
    )
);

-- RLS: SPPSC-SP003
GRANT SELECT ON service_provider_product_suspension_comment_history
TO flex_service_provider;
CREATE POLICY "SPPSC_SP003"
ON service_provider_product_suspension_comment_history
FOR SELECT
TO flex_service_provider
USING (
    EXISTS (
        SELECT 1
        FROM flex.service_provider_product_suspension_history AS sppsh
            INNER JOIN flex.identity AS comment_creator
                ON service_provider_product_suspension_comment_history.created_by -- noqa
                    = comment_creator.id
            INNER JOIN flex.party AS comment_creator_party
                ON comment_creator.party_id = comment_creator_party.id
            INNER JOIN flex.party AS current_party
                ON current_party.id = (SELECT flex.current_party())
        WHERE sppsh.id = service_provider_product_suspension_comment_history.service_provider_product_suspension_id -- noqa
            AND sppsh.service_provider_id = current_party.id
            AND ((
                service_provider_product_suspension_comment_history.visibility = 'same_party' -- noqa
                AND comment_creator.party_id = current_party.id -- noqa
            ) OR (
                service_provider_product_suspension_comment_history.visibility = 'same_party_type' -- noqa
                AND current_party.type = comment_creator_party.type
            ) OR service_provider_product_suspension_comment_history.visibility = 'any_party') -- no check there -- noqa
    )
);

-- RLS: SPPAC-FISO001
CREATE POLICY "SPPAC_FISO001"
ON service_provider_product_suspension_comment
FOR ALL
TO flex_flexibility_information_system_operator
USING (true);

-- RLS: SPPAC-FISO002
GRANT SELECT ON service_provider_product_suspension_comment_history
TO flex_flexibility_information_system_operator;
CREATE POLICY "SPPAC_FISO002"
ON service_provider_product_suspension_comment_history
FOR ALL
TO flex_flexibility_information_system_operator
USING (true);

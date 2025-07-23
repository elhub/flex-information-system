--liquibase formatted sql
-- Manually managed file

-- changeset flex:event-rls runAlways:true endDelimiter:;
ALTER TABLE IF EXISTS event ENABLE ROW LEVEL SECURITY;

-- internal
GRANT SELECT ON event TO flex_internal_event_notification;
CREATE POLICY "EVENT_INTERNAL_EVENT_NOTIFICATION" ON event
FOR SELECT
TO flex_internal_event_notification
USING (true);

GRANT SELECT ON event TO flex_end_user;

-- RLS: EVENT-EU001
CREATE POLICY "EVENT_EU001" ON event
FOR SELECT
TO flex_end_user
USING (
    source_resource = 'controllable_unit' AND EXISTS (
        SELECT 1
        FROM flex.controllable_unit_end_user AS cueu
        WHERE cueu.controllable_unit_id = event.source_id -- noqa
            AND cueu.end_user_id = (SELECT flex.current_party())
            AND cueu.valid_time_range @> lower(event.record_time_range) -- noqa
    )
);

-- RLS: EVENT-EU002
CREATE POLICY "EVENT_EU002" ON event
FOR SELECT
TO flex_end_user
USING (
    source_resource = 'controllable_unit_service_provider' AND EXISTS (
        SELECT 1
        FROM flex.controllable_unit_service_provider AS cusp
            INNER JOIN flex.controllable_unit_end_user AS cueu
                ON cusp.controllable_unit_id = cueu.controllable_unit_id
                    AND cueu.valid_time_range @> lower(event.record_time_range) -- noqa
                    AND cueu.end_user_id = (SELECT flex.current_party())
        WHERE cusp.id = event.source_id -- noqa
    )
);

-- RLS: EVENT-EU003
CREATE POLICY "EVENT_EU003" ON event
FOR SELECT
TO flex_end_user
USING (
    source_resource = 'technical_resource' AND EXISTS (
        SELECT 1
        FROM flex.technical_resource AS tr
            INNER JOIN flex.controllable_unit_end_user AS cueu
                ON tr.controllable_unit_id = cueu.controllable_unit_id
                    AND cueu.valid_time_range @> lower(event.record_time_range) -- noqa
                    AND cueu.end_user_id = (SELECT flex.current_party())
        WHERE tr.id = event.source_id -- noqa
    )
);

-- RLS: EVENT-FISO001
GRANT SELECT ON event TO flex_flexibility_information_system_operator;
CREATE POLICY "EVENT_FISO001" ON event
FOR SELECT
TO flex_flexibility_information_system_operator
USING (true);

-- RLS: EVENT-SO001
GRANT SELECT ON event TO flex_system_operator;
CREATE POLICY "EVENT_SO001" ON event
FOR SELECT
TO flex_system_operator
USING (
    source_resource IN (
        'controllable_unit',
        'controllable_unit_service_provider',
        'technical_resource',
        'system_operator_product_type',
        'service_provider_product_application',
        'service_provider_product_application_comment',
        'service_providing_group',
        'service_providing_group_membership',
        'service_providing_group_grid_prequalification',
        'service_providing_group_product_application'
    )
);

GRANT SELECT ON event TO flex_service_provider;

-- RLS: EVENT-SP001
CREATE POLICY "EVENT_SP001" ON event
FOR SELECT
TO flex_service_provider
USING (
    source_resource = 'controllable_unit'
    AND NOT (type ~ 'no.elhub.flex.controllable_unit.lookup')
    AND EXISTS (
        SELECT 1
        FROM flex.controllable_unit_service_provider AS cusp
        WHERE cusp.controllable_unit_id = event.source_id -- noqa
            AND cusp.valid_time_range @> lower(event.record_time_range) -- noqa
            AND cusp.service_provider_id = (SELECT flex.current_party())
    )
);

-- RLS: EVENT-SP002
CREATE POLICY "EVENT_SP002" ON event
FOR SELECT
TO flex_service_provider
USING (
    source_resource = 'controllable_unit_service_provider' AND EXISTS (
        SELECT 1
        FROM flex.controllable_unit_service_provider AS cusp
        WHERE cusp.id = event.source_id -- noqa
            AND cusp.service_provider_id = (SELECT flex.current_party())
    )
);

-- RLS: EVENT-SP003
CREATE POLICY "EVENT_SP003" ON event
FOR SELECT
TO flex_service_provider
USING (
    source_resource = 'technical_resource'
    AND EXISTS (
        SELECT 1
        FROM flex.technical_resource AS tr
            INNER JOIN flex.controllable_unit AS cu
                ON tr.controllable_unit_id = cu.id
            INNER JOIN flex.controllable_unit_service_provider AS cusp
                ON cu.id = cusp.controllable_unit_id
                    AND cusp.valid_time_range @> lower(event.record_time_range) -- noqa
        WHERE tr.id = event.source_id -- noqa
            AND cusp.service_provider_id = (SELECT flex.current_party())
    )
);

-- RLS: EVENT-SP004
CREATE POLICY "EVENT_SP004" ON event
FOR SELECT
TO flex_service_provider
USING (
    source_resource = 'service_provider_product_application' AND EXISTS (
        SELECT 1
        FROM flex.service_provider_product_application AS sppa
        WHERE sppa.id = event.source_id -- noqa
            AND sppa.service_provider_id = (SELECT flex.current_party())
    )
);

-- RLS: EVENT-SP005
CREATE POLICY "EVENT_SP005" ON event
FOR SELECT
TO flex_service_provider
USING (
    source_resource = 'service_provider_product_application_comment'
    AND EXISTS (
        SELECT 1
        FROM flex.service_provider_product_application_comment AS sppac
            INNER JOIN flex.service_provider_product_application AS sppa
                ON sppac.service_provider_product_application_id = sppa.id
        WHERE sppac.id = event.source_id -- noqa
            AND sppa.service_provider_id = (SELECT flex.current_party())
    )
);

-- RLS: EVENT-SP006
CREATE POLICY "EVENT_SP006" ON event
FOR SELECT
TO flex_service_provider
USING (
    source_resource = 'service_providing_group' AND EXISTS (
        SELECT 1
        FROM flex.service_providing_group AS spg
        WHERE spg.id = event.source_id -- noqa
            AND spg.service_provider_id = (SELECT flex.current_party())
    )
);

-- RLS: EVENT-SP007
CREATE POLICY "EVENT_SP007" ON event
FOR SELECT
TO flex_service_provider
USING (
    source_resource = 'service_providing_group_membership' AND EXISTS (
        SELECT 1
        FROM flex.service_providing_group_membership AS spgm
            INNER JOIN flex.service_providing_group AS spg
                ON spgm.service_providing_group_id = spg.id
        WHERE spgm.id = event.source_id -- noqa
            AND spg.service_provider_id = (SELECT flex.current_party())
    )
);

-- RLS: EVENT-SP008
CREATE POLICY "EVENT_SP008" ON event
FOR SELECT
TO flex_service_provider
USING (
    source_resource = 'service_providing_group_grid_prequalification'
    AND EXISTS (
        SELECT 1
        FROM flex.service_providing_group_grid_prequalification AS spggp
            INNER JOIN flex.service_providing_group AS spg
                ON spggp.service_providing_group_id = spg.id
        WHERE spggp.id = event.source_id -- noqa
            AND spg.service_provider_id = (SELECT flex.current_party())
    )
);

-- RLS: EVENT-SP009
CREATE POLICY "EVENT_SP009" ON event
FOR SELECT
TO flex_service_provider
USING (
    source_resource = 'service_providing_group_product_application' AND EXISTS (
        SELECT 1
        FROM flex.service_providing_group_product_application AS spgpa
            INNER JOIN flex.service_providing_group AS spg
                ON spgpa.service_providing_group_id = spg.id
        WHERE spgpa.id = event.source_id -- noqa
            AND spg.service_provider_id = (SELECT flex.current_party())
    )
);

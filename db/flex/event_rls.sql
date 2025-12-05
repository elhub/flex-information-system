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
-- RLS: EVENT-EU002
-- RLS: EVENT-EU003
CREATE POLICY "EVENT_EU001_002_003" ON event
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
        'controllable_unit',                         -- CU, TR, CUSP, CUS
        'controllable_unit_suspension',              -- CUSC
        'system_operator_product_type',              -- SOPT
        'service_provider_product_application',      -- SPPA, SPPAC
        'service_provider_product_suspension',       -- SPPS, SPPSC
        'service_providing_group',                   -- SPG, SPGM, SPGGP, SPGGS, SPGPS
        'service_providing_group_grid_suspension',   -- SPGGSC
        'service_providing_group_product_suspension' -- SPGPSC
    )
);

GRANT SELECT ON event TO flex_service_provider;

-- RLS: EVENT-SP001
-- RLS: EVENT-SP002
-- RLS: EVENT-SP017
CREATE POLICY "EVENT_SP001_002_017" ON event
FOR SELECT
TO flex_service_provider
USING (
    source_resource = 'controllable_unit'
    AND (
        subject_resource IS null OR subject_resource IN (
            null,
            'technical_resource',
            'controllable_unit_suspension'
        )
    )
    AND NOT (type ~ 'no.elhub.flex.controllable_unit.lookup')
    AND EXISTS (
        SELECT 1
        FROM flex.controllable_unit_service_provider AS cusp
        WHERE cusp.controllable_unit_id = event.source_id -- noqa
            AND cusp.valid_time_range @> lower(event.record_time_range) -- noqa
            AND cusp.service_provider_id = (SELECT flex.current_party())
    )
);

-- RLS: EVENT-SP003
CREATE POLICY "EVENT_SP003" ON event
FOR SELECT
TO flex_service_provider
USING (
    subject_resource = 'controllable_unit_service_provider' AND EXISTS (
        SELECT 1
        FROM flex.controllable_unit_service_provider AS cusp
        WHERE cusp.id = event.subject_id -- noqa
            AND cusp.service_provider_id = (SELECT flex.current_party())
    )
);

-- RLS: EVENT-SP004
CREATE POLICY "EVENT_SP004" ON event
FOR SELECT
TO flex_service_provider
USING (
    source_resource = 'service_provider_product_application'
    AND subject_resource IS null
    AND EXISTS (
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
    subject_resource = 'service_provider_product_application_comment'
    AND EXISTS (
        SELECT 1
        FROM flex.service_provider_product_application_comment AS sppac
            INNER JOIN flex.service_provider_product_application AS sppa
                ON sppac.service_provider_product_application_id = sppa.id
        WHERE sppac.id = event.subject_id -- noqa
            AND sppa.service_provider_id = (SELECT flex.current_party())
    )
);

-- RLS: EVENT-SP006
CREATE POLICY "EVENT_SP006" ON event
FOR SELECT
TO flex_service_provider
USING (
    source_resource = 'service_providing_group'
    AND subject_resource IS null
    AND EXISTS (
        SELECT 1
        FROM flex.service_providing_group AS spg
        WHERE spg.id = event.source_id -- noqa
            AND spg.service_provider_id = (SELECT flex.current_party())
    )
);

-- RLS: EVENT-SP007
-- RLS: EVENT-SP008
-- RLS: EVENT-SP009
-- RLS: EVENT-SP013
-- RLS: EVENT-SP015
CREATE POLICY "EVENT_SP007_008_009_013_015" ON event
FOR SELECT
TO flex_service_provider
USING (
    (
        subject_resource IS null OR subject_resource IN (
            null,
            'service_providing_group_membership',
            'service_providing_group_grid_prequalification',
            'service_providing_group_grid_suspension',
            'service_providing_group_product_application',
            'service_providing_group_product_suspension'
        )
    )
    AND EXISTS (
        SELECT 1
        FROM flex.service_providing_group AS spg
        WHERE spg.id = event.source_id -- noqa
            AND spg.service_provider_id = (SELECT flex.current_party())
    )
);

-- RLS: EVENT-SP010
CREATE POLICY "EVENT_SP010" ON event
FOR SELECT
TO flex_service_provider
USING (source_resource = 'system_operator_product_type');

-- RLS: EVENT-SP011
CREATE POLICY "EVENT_SP011" ON event
FOR SELECT
TO flex_service_provider
USING (
    source_resource = 'service_provider_product_suspension'
    AND subject_resource IS null
    AND (
        EXISTS (
            SELECT 1
            FROM flex.service_provider_product_suspension AS spps
            WHERE spps.id = event.source_id -- noqa
                AND spps.service_provider_id = (SELECT flex.current_party())
        )
        -- checking history because the SPPS may have been deleted since
        OR EXISTS (
            SELECT 1
            FROM flex.service_provider_product_suspension_history AS sppsh
            WHERE sppsh.id = event.source_id -- noqa
                AND sppsh.service_provider_id = (SELECT flex.current_party())
        )
    )
);

-- RLS: EVENT-SP012
CREATE POLICY "EVENT_SP012" ON event
FOR SELECT
TO flex_service_provider
USING (
    subject_resource = 'service_provider_product_suspension_comment'
    AND EXISTS (
        WITH
            sppsch AS (
                SELECT
                    sppsc.service_provider_product_suspension_id,
                    sppsc.record_time_range
                FROM flex.service_provider_product_suspension_comment AS sppsc
                WHERE sppsc.id = event.subject_id -- noqa
                UNION ALL
                SELECT
                    sppsch.service_provider_product_suspension_id,
                    sppsch.record_time_range
                FROM
                    flex.service_provider_product_suspension_comment_history
                        AS sppsch -- noqa
                WHERE sppsch.id = event.subject_id -- noqa
            )

        SELECT 1
        FROM sppsch
            INNER JOIN flex.service_provider_product_suspension_history AS sppsh
                ON sppsch.service_provider_product_suspension_id = sppsh.id
        WHERE sppsh.service_provider_id = (SELECT flex.current_party())
            AND sppsch.record_time_range @> lower(event.record_time_range) -- noqa
    )
);

-- RLS: EVENT-SP014
CREATE POLICY "EVENT_SP014" ON event
FOR SELECT
TO flex_service_provider
USING (
    subject_resource = 'service_providing_group_grid_suspension_comment'
    AND EXISTS (
        SELECT 1
        FROM flex.service_providing_group_grid_suspension_comment AS spggsc
        WHERE spggsc.id = event.subject_id -- noqa
            AND spggsc.record_time_range @> lower(event.record_time_range) -- noqa
        UNION ALL
        SELECT 1
        FROM
            flex.service_providing_group_grid_suspension_comment_history
                AS spggsch -- noqa
        WHERE spggsch.id = event.subject_id -- noqa
            AND spggsch.record_time_range @> lower(event.record_time_range) -- noqa
    )
);

-- RLS: EVENT-SP016
CREATE POLICY "EVENT_SP016" ON event
FOR SELECT
TO flex_service_provider
USING (
    subject_resource = 'service_providing_group_product_suspension_comment'
    AND EXISTS (
        SELECT 1
        FROM flex.service_providing_group_product_suspension_comment AS spgpsc
        WHERE spgpsc.id = event.subject_id -- noqa
            AND spgpsc.record_time_range @> lower(event.record_time_range) -- noqa
        UNION ALL
        SELECT 1
        FROM
            flex.service_providing_group_product_suspension_comment_history
                AS spgpsch -- noqa
        WHERE spgpsch.id = event.subject_id -- noqa
            AND spgpsch.record_time_range @> lower(event.record_time_range) -- noqa
    )
);

-- RLS: EVENT-SP018
CREATE POLICY "EVENT_SP018" ON event
FOR SELECT
TO flex_service_provider
USING (
    subject_resource = 'controllable_unit_suspension_comment'
    AND EXISTS (
        SELECT 1
        FROM flex.controllable_unit_suspension_comment AS cusc
        WHERE cusc.id = event.subject_id -- noqa
            AND cusc.record_time_range @> lower(event.record_time_range) -- noqa
        UNION ALL
        SELECT 1
        FROM flex.controllable_unit_suspension_comment_history AS cusch
        WHERE cusch.id = event.subject_id -- noqa
            AND cusch.record_time_range @> lower(event.record_time_range) -- noqa
    )
);

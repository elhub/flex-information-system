ALTER TABLE IF EXISTS controllable_unit ENABLE ROW LEVEL SECURITY;

-- internal
GRANT SELECT ON controllable_unit TO flex_internal_event_notification;
CREATE POLICY "CU_INTERNAL_EVENT_NOTIFICATION" ON controllable_unit
FOR SELECT
TO flex_internal_event_notification
USING (true);

GRANT SELECT ON controllable_unit_history TO flex_internal_event_notification;
CREATE POLICY "CUH_INTERNAL_EVENT_NOTIFICATION" ON controllable_unit
FOR SELECT
TO flex_internal_event_notification
USING (true);

-- RLS: CU-FISO001
GRANT SELECT, INSERT, UPDATE ON controllable_unit
TO flex_flexibility_information_system_operator;
CREATE POLICY "CU_FISO001" ON controllable_unit
FOR ALL
TO flex_flexibility_information_system_operator
USING (true);

-- RLS: CU-SO001
GRANT SELECT, UPDATE ON controllable_unit TO flex_system_operator;
CREATE POLICY "CU_SO001" ON controllable_unit
FOR ALL
TO flex_system_operator
USING (
    EXISTS (
        SELECT 1 FROM
            accounting_point
        WHERE accounting_point.business_id = controllable_unit.accounting_point_id --noqa
            AND accounting_point.system_operator_id = current_party()
    )
);

-- RLS: CU-SO002
CREATE POLICY "CU_SO002" ON controllable_unit
FOR SELECT
TO flex_system_operator
USING (
    EXISTS (
        SELECT 1 FROM service_providing_group_membership
        WHERE service_providing_group_membership.controllable_unit_id = controllable_unit.id -- noqa
    )
);

GRANT SELECT, INSERT, UPDATE ON controllable_unit TO flex_service_provider;
-- RLS: CU-SP001
CREATE POLICY "CU_SP001" ON controllable_unit
FOR SELECT
TO flex_service_provider
USING (
    -- the SP is or has been in charge of the CU
    EXISTS (
        SELECT 1
        FROM controllable_unit_service_provider
        WHERE controllable_unit_service_provider.controllable_unit_id = controllable_unit.id -- noqa
            AND controllable_unit_service_provider.service_provider_id
            = current_party()
    ) OR (
        -- the SP created the CU
        created_by_party_id = current_party()
    )
);

-- RLS: CU-SP002
CREATE POLICY "CU_SP002" ON controllable_unit
FOR INSERT
TO flex_service_provider
WITH CHECK (true);

-- RLS: CU-SP003
CREATE POLICY "CU_SP003" ON controllable_unit
FOR UPDATE
TO flex_service_provider
USING (
    -- the active contract of the CU is the SP
    EXISTS (
        SELECT 1 FROM controllable_unit_service_provider
        WHERE controllable_unit_service_provider.controllable_unit_id = controllable_unit.id -- noqa
            AND controllable_unit_service_provider.service_provider_id
            = current_party()
            AND controllable_unit_service_provider.valid_time_range
            @> current_timestamp
    )
);

-- RLS: CU-EU001

-- check as a SECURITY DEFINER function because AP/APEU have restricted access
CREATE OR REPLACE FUNCTION check_cu_eu001(
    eu_id bigint, cu_ap_id text
)
RETURNS boolean
SECURITY DEFINER
LANGUAGE sql
AS $$
SELECT EXISTS (
    SELECT 1
        FROM accounting_point AS ap
        INNER JOIN accounting_point_end_user AS apeu
            ON apeu.accounting_point_id = ap.id
    WHERE ap.business_id = cu_ap_id
        AND apeu.end_user_id = eu_id
        AND apeu.valid_time_range @> current_timestamp
);
$$;

GRANT SELECT ON controllable_unit TO flex_end_user;
CREATE POLICY "CU_EU001" ON controllable_unit
FOR SELECT
TO flex_end_user
USING (
    check_cu_eu001(
        current_party(),
        controllable_unit.accounting_point_id
    )
    -- EXISTS (
    --     SELECT 1
    --         FROM accounting_point AS ap -- noqa
    --         INNER JOIN accounting_point_end_user AS apeu
    --             ON apeu.accounting_point_id = ap.id
    --     WHERE ap.business_id = controllable_unit.accounting_point_id -- noqa
    --         AND apeu.end_user_id = current_party()
    --         AND apeu.valid_time_range @> current_timestamp
    -- )
);

ALTER TABLE IF EXISTS controllable_unit_history
ENABLE ROW LEVEL SECURITY;

-- RLS: CU-EU002

-- check as a SECURITY DEFINER function because AP/APEU have restricted access
CREATE OR REPLACE FUNCTION check_cu_eu002(
    eu_id bigint, cuh_ap_id text, cuh_record_time_range tstzrange
)
RETURNS boolean
SECURITY DEFINER
LANGUAGE sql
AS $$
SELECT EXISTS (
    SELECT 1
        FROM accounting_point AS ap
        INNER JOIN accounting_point_end_user AS apeu
            ON apeu.accounting_point_id = ap.id
    WHERE ap.business_id = cuh_ap_id
        -- this version of the CU in the history was in effect
        -- when the current party was the end user of its AP
        AND apeu.end_user_id = eu_id
        AND apeu.valid_time_range && cuh_record_time_range
);
$$;

GRANT SELECT ON controllable_unit_history TO flex_end_user;
CREATE POLICY "CU_EU002"
ON controllable_unit_history
FOR SELECT
TO flex_end_user
USING (
    check_cu_eu002(
        current_party(),
        controllable_unit_history.accounting_point_id,
        controllable_unit_history.record_time_range
    )
);

-- RLS: CU-FISO002
GRANT SELECT ON controllable_unit_history
TO flex_flexibility_information_system_operator;
CREATE POLICY "CU_FISO002"
ON controllable_unit_history
FOR SELECT
TO flex_flexibility_information_system_operator
USING (true);

-- RLS: CU-SO003
GRANT SELECT ON controllable_unit_history
TO flex_system_operator;
CREATE POLICY "CU_SO003"
ON controllable_unit_history
FOR SELECT
TO flex_system_operator
USING (
    EXISTS (
        SELECT 1
        FROM controllable_unit
        WHERE controllable_unit_history.id = controllable_unit.id -- noqa
    )
);

-- RLS: CU-SP004
GRANT SELECT ON controllable_unit_history
TO flex_service_provider;
CREATE POLICY "CU_SP004"
ON controllable_unit_history
FOR SELECT
TO flex_service_provider
USING (
    EXISTS (
        SELECT 1
        FROM controllable_unit
        WHERE controllable_unit_history.id = controllable_unit.id -- noqa
    )
);

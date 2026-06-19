--liquibase formatted sql
-- Manually managed file

-- changeset flex:api-current-controllable-unit-accounting-point endDelimiter:-- runOnChange:true
CREATE OR REPLACE FUNCTION
api.current_controllable_unit_accounting_point(
    l_controllable_unit_business_id text
)
RETURNS TABLE (
    accounting_point_id bigint,
    accounting_point_business_id text
)
SECURITY DEFINER -- SP has the CU's business ID but cannot necessarily read it
LANGUAGE sql
AS $$
    SELECT
        ap.id AS accounting_point_id,
        ap.business_id AS accounting_point_business_id
    FROM flex.controllable_unit AS cu
        INNER JOIN flex.accounting_point AS ap
            ON cu.accounting_point_id = ap.id
    WHERE cu.business_id = l_controllable_unit_business_id::uuid;
$$;


-- changeset flex:api-controllable-unit-lookup-sync-accounting-point endDelimiter:-- runOnChange:true
DROP FUNCTION IF EXISTS api.controllable_unit_lookup_sync_accounting_point(
    text, text, text
);

-- changeset flex:api-controllable-unit-lookup-check-end-user-matches-accounting-point endDelimiter:-- runOnChange:true
CREATE OR REPLACE FUNCTION
api.controllable_unit_lookup_check_end_user_matches_accounting_point(
    l_end_user_business_id text,
    l_accounting_point_business_id text
)
RETURNS TABLE (
    end_user_id bigint
)
SECURITY DEFINER -- AP-EU is internal
LANGUAGE sql
AS $$
    SELECT p.id AS end_user_id
    FROM flex.accounting_point AS ap
        INNER JOIN flex.accounting_point_end_user AS apeu
            ON ap.id = apeu.accounting_point_id
        INNER JOIN flex.party AS p
            ON apeu.end_user_id = p.id
        INNER JOIN flex.entity AS e
            ON p.entity_id = e.id
    WHERE ap.business_id = l_accounting_point_business_id
        AND (
            -- organisation: match by business_id directly
            (l_end_user_business_id ~ '^[1-9][0-9]{8}$'
                AND e.business_id = l_end_user_business_id)
            OR
            -- person: match by birth date encoded in the PID (DDMMYY = first 6 digits)
            (l_end_user_business_id ~ '^[0-9]{6}$'
                AND e.business_id_type = 'pid'
                AND LEFT(e.business_id, 6) = l_end_user_business_id)
        )
        AND apeu.valid_time_range @> current_timestamp;
$$;

-- changeset flex:api-controllable-unit-lookup-drop
DROP FUNCTION IF EXISTS api.controllable_unit_lookup(text, text);

-- changeset flex:api-current-controllable-unit-accounting-point-grants runOnChange:true
REVOKE EXECUTE ON FUNCTION api.current_controllable_unit_accounting_point(
    text
) FROM public;
GRANT EXECUTE ON FUNCTION api.current_controllable_unit_accounting_point(
    text
) TO flex_internal_data;

-- changeset flex:api-controllable-unit-lookup-check-end-user-matches-accounting-point-grants runOnChange:true
REVOKE EXECUTE ON FUNCTION
api.controllable_unit_lookup_check_end_user_matches_accounting_point(text, text)
FROM public;
GRANT EXECUTE ON FUNCTION
api.controllable_unit_lookup_check_end_user_matches_accounting_point(text, text)
TO flex_internal_data;

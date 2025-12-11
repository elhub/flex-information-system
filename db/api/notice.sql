--liquibase formatted sql
-- Manually managed file

-- changeset flex:api-notice-create endDelimiter:-- runAlways:true
CREATE OR REPLACE VIEW api.notice
WITH (security_invoker = false, security_barrier = true) AS ( -- cf AP-BRP
    SELECT
        data,
        party_id,
        source,
        type
    FROM flex.notice
    -- no RLS policies for views, so we need to have them built-in
    WHERE
        -- RLS: NOTICE-FISO001
        current_role = 'flex_flexibility_information_system_operator'
        -- RLS: NOTICE-COM001
        OR party_id = (SELECT flex.current_party())
);

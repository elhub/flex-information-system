--liquibase formatted sql
-- Manually managed file

-- changeset flex:api-notice-create endDelimiter:-- runAlways:true
CREATE OR REPLACE VIEW api.notice
WITH (security_invoker = false, security_barrier = true) AS ( -- cf AP-BRP
    SELECT
        data,
        party_id,
        type,
        CASE
            WHEN source_resource IS null OR source_id IS null THEN null
            ELSE '/' || source_resource || '/' || source_id
        END
        AS source
    FROM flex.notice_fresh
    -- no RLS policies for views, so we need to have them built-in
    WHERE
        -- RLS: NOTICE-FISO001
        current_role = 'flex_flexibility_information_system_operator'
        -- RLS: NOTICE-COM001
        OR party_id = (SELECT flex.current_party())
);

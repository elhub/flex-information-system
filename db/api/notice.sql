-- Manually managed file

CREATE OR REPLACE VIEW notice
WITH (security_invoker = true) AS (
    SELECT
        id,
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
        OR party_id = flex.current_party()
);

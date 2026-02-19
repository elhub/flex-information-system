--liquibase formatted sql
-- Manually managed file

-- changeset flex:notice-rls runAlways:true endDelimiter:;
ALTER TABLE IF EXISTS notice ENABLE ROW LEVEL SECURITY;

-- RLS: NOTICE-COM001
GRANT SELECT, UPDATE ON notice TO flex_common;
CREATE POLICY "NOTICE_COM001" ON notice
FOR ALL
TO flex_common
USING (party_id = (SELECT flex.current_party()));

-- RLS: NOTICE-FISO001
CREATE POLICY "NOTICE_FISO001" ON notice
FOR SELECT
TO flex_flexibility_information_system_operator
USING (true);

-- internal: used for reading events on notices (notice history is not exposed)
-- user can read history when they can read a notice
GRANT SELECT, UPDATE ON notice_history TO flex_common;
CREATE POLICY "NOTICEH_INTERNAL" ON notice_history
FOR ALL
TO flex_common
USING (
    EXISTS (
        SELECT 1 FROM flex.notice AS n
        WHERE n.id = notice_history.id -- noqa
    )
);

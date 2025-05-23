--liquibase formatted sql
-- Manually managed file

-- changeset flex:event-rls runAlways:true endDelimiter:;
ALTER TABLE IF EXISTS event ENABLE ROW LEVEL SECURITY;

-- RLS: EVENT-COM001
GRANT SELECT ON event TO flex_common;
CREATE POLICY "EVENT_COM001" ON event
FOR SELECT
TO flex_common
USING (true);

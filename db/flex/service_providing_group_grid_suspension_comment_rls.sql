--liquibase formatted sql
-- Manually managed file

-- changeset flex:service-providing-group-grid-suspension-comment-rls runAlways:true endDelimiter:;
ALTER TABLE IF EXISTS service_providing_group_grid_suspension_comment
ENABLE ROW LEVEL SECURITY;

-- internal
GRANT SELECT ON service_providing_group_grid_suspension_comment
TO flex_internal_event_notification;
CREATE POLICY "SPGGSC_INTERNAL_EVENT_NOTIFICATION"
ON service_providing_group_grid_suspension_comment
FOR SELECT
TO flex_internal_event_notification
USING (true);

GRANT SELECT, INSERT, UPDATE
ON service_providing_group_grid_suspension_comment
TO flex_common;

-- TODO REMOVE
CREATE POLICY "SPGGSC_TMP"
ON service_providing_group_grid_suspension_comment
FOR ALL
TO flex_common
USING (true);

-- TODO REMOVE
GRANT SELECT
ON service_providing_group_grid_suspension_comment_history
TO flex_common;
CREATE POLICY "SPGGSCH_TMP"
ON service_providing_group_grid_suspension_comment_history
FOR ALL
TO flex_common
USING (true);

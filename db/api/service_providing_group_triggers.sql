--liquibase formatted sql
-- Manually managed file

-- changeset flex:api-service-providing-group-upsert endDelimiter:-- runAlways:true
CREATE OR REPLACE TRIGGER service_providing_group_membership_upsert
INSTEAD OF INSERT OR UPDATE
ON api.service_providing_group_membership
FOR EACH ROW
EXECUTE PROCEDURE timeline.upsert(
    'flex.service_providing_group_membership',
    'controllable_unit_id,service_providing_group_id'
);

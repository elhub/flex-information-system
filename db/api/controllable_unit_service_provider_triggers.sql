--liquibase formatted sql
-- Manually managed file

-- changeset flex:api-controllable-unit-service-provider-upsert endDelimiter:-- runAlways:true
CREATE OR REPLACE TRIGGER controllable_unit_service_provider_upsert
INSTEAD OF INSERT OR UPDATE
ON api.controllable_unit_service_provider
FOR EACH ROW
EXECUTE PROCEDURE timeline.upsert(
    'flex.controllable_unit_service_provider',
    'controllable_unit_id,service_provider_id,contract_reference'
);

--liquibase formatted sql
-- Manually managed file

-- changeset flex:api-controllable-unit-service-provider-delete-revoke runOnChange:true endDelimiter:;
REVOKE DELETE ON TABLE
api.controllable_unit_service_provider
FROM flex_service_provider;

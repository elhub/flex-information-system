--liquibase formatted sql
-- Manually managed file

-- changeset flex:drop-auth-entity-of-credentials runOnChange:false endDelimiter:--
DROP FUNCTION IF EXISTS auth.entity_of_credentials(text, text);

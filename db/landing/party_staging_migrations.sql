--liquibase formatted sql
-- Manually managed file

-- changeset flex:party-staging-change-schema runAlways:true endDelimiter:;
ALTER TABLE IF EXISTS flex.party_staging SET SCHEMA landing;

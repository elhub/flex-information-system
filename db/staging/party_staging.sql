--liquibase formatted sql
-- Manually managed file

-- changeset flex:party-staging-view runOnChange:true endDelimiter:--
-- abstraction/decoupling layer above the party staging table
CREATE OR REPLACE VIEW staging.party_staging_v AS (
    SELECT
        gln,
        org,
        name,
        type
    FROM flex.party_staging
);

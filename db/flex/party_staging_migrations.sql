--liquibase formatted sql
-- Manually managed file

-- changeset flex:party-staging-add-entity-party runOnChange:false endDelimiter:;
ALTER TABLE flex.party_staging
DROP CONSTRAINT IF EXISTS party_staging_type_check;
ALTER TABLE flex.party_staging
ADD CONSTRAINT party_staging_type_check CHECK (
    type IN (
        'balance_responsible_party',
        'end_user',
        'energy_supplier',
        'flexibility_information_system_operator',
        'market_operator',
        'organisation',
        'service_provider',
        'system_operator',
        'third_party'
    )
);

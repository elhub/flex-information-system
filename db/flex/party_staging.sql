--liquibase formatted sql
-- Manually managed file

-- landing table for party data updates coming from external sources
-- NOTE: when testing locally, run test_data.fill_party_staging() to populate
-- changeset flex:party-staging-create runOnChange:false endDelimiter:--
CREATE TABLE IF NOT EXISTS party_staging (
    id bigint PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
    party_gln text CHECK (validate_business_id(party_gln, 'gln')),
    entity_org text NOT NULL CHECK (validate_business_id(entity_org, 'org')),
    name text NOT NULL,
    type text NOT NULL CHECK (
        type IN (
            'balance_responsible_party',
            'end_user',
            'energy_supplier',
            'flexibility_information_system_operator',
            'market_operator',
            'service_provider',
            'system_operator',
            'third_party'
        )
    ),

    CONSTRAINT uk_party_staging_gln_type UNIQUE (party_gln, type)
);

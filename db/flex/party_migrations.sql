--liquibase formatted sql
-- Manually managed file

-- changeset flex:party-add-entity-party runOnChange:false endDelimiter:;
ALTER TABLE flex.party DROP CONSTRAINT IF EXISTS check_party_business_id_type;
ALTER TABLE flex.party ADD CONSTRAINT check_party_business_id_type CHECK (
    business_id_type IN (
        'gln',
        'uuid',
        'eic_x',
        'org'
    )
);

ALTER TABLE flex.party DROP CONSTRAINT IF EXISTS check_party_type;
ALTER TABLE flex.party ADD CONSTRAINT check_party_type CHECK (
    type IN (
        'balance_responsible_party',
        'end_user',
        'energy_supplier',
        'entity',
        'flexibility_information_system_operator',
        'market_operator',
        'service_provider',
        'system_operator',
        'third_party'
    )
);

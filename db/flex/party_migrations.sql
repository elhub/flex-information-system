--liquibase formatted sql
-- Manually managed file

-- changeset flex:party-add-entity-party runOnChange:false endDelimiter:;
--preconditions onFail:MARK_RAN
--precondition-sql-check expectedResult:0 SELECT COUNT(*) FROM pg_catalog.pg_constraint WHERE conname = 'check_organisation_iff_org'
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
        'flexibility_information_system_operator',
        'market_operator',
        'organisation',
        'service_provider',
        'system_operator',
        'third_party'
    )
);

ALTER TABLE flex.party ADD CONSTRAINT check_organisation_iff_org CHECK (
    (type = 'organisation' AND business_id_type = 'org')
    OR
    (type != 'organisation' AND business_id_type != 'org')
);

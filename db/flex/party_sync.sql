--liquibase formatted sql
-- Manually managed file

-- landing table for party data updates coming from external sources
-- changeset flex:party-sync-create runOnChange:false endDelimiter:--
CREATE TABLE IF NOT EXISTS party_sync (
    party_gln text PRIMARY KEY CHECK (validate_business_id(party_gln, 'gln')),
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
    )
);

-- on creation, this table takes a snapshot of the current party data
-- changeset flex:party-sync-copy runOnChange:false endDelimiter:--
--preconditions onFail:MARK_RAN
--precondition-sql-check expectedResult:0 SELECT COUNT(*) FROM flex.party_sync
INSERT INTO flex.party_sync (party_gln, entity_org, name, type)
SELECT
    p.business_id AS party_gln,
    e.business_id AS entity_org,
    p.name,
    p.type
FROM flex.party AS p
    INNER JOIN flex.entity AS e ON p.entity_id = e.id
WHERE p.business_id_type = 'gln'
    AND e.business_id_type = 'org'
    AND p.status != 'terminated';

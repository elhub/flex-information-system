--liquibase formatted sql
-- Manually managed file

-- changeset flex:party-membership-create runOnChange:false endDelimiter:--
-- validCheckSum: 9:759e63e7f77b260a1137208ea9d7162e
-- noqa: disable=all
CREATE TABLE IF NOT EXISTS party_membership (
    id bigint PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
    party_id bigint NOT NULL,
    entity_id bigint NOT NULL,
    scopes text [] NOT NULL,
    record_time_range tstzrange NOT NULL DEFAULT tstzrange(
        localtimestamp, null, '[)'
    ),
    recorded_by bigint NOT NULL DEFAULT current_identity(),
    CONSTRAINT fk_party_membership_party_id FOREIGN KEY (party_id)
    REFERENCES party (id),
    CONSTRAINT fk_party_membership_entity_id FOREIGN KEY (entity_id)
    REFERENCES entity (id),
    CONSTRAINT uk_party_membership_entity_party_id UNIQUE (party_id, entity_id),
    CONSTRAINT check_party_membership_scopes CHECK (
        -- operator defined in utils/operators
        array_length(scopes, 1) > 0
        AND '^([a-z][a-z_]*)(:[a-z][a-z_]*)*$' #~ all(scopes)
    )
);
-- noqa: enable=all

-- changeset flex:party-membership-capture-event runOnChange:true endDelimiter:--
CREATE OR REPLACE TRIGGER party_membership_event
AFTER INSERT OR DELETE ON party_membership
FOR EACH ROW
EXECUTE FUNCTION capture_event('party_membership');

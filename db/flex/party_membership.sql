--liquibase formatted sql
-- Manually managed file

-- changeset flex:party-membership-create runOnChange:false endDelimiter:--
-- validCheckSum: 9:9c93025c532e68d17e432e60b3dc0ed6
-- noqa: disable=all
CREATE TABLE IF NOT EXISTS party_membership (
    id bigint PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
    party_id bigint NOT NULL,
    entity_id bigint NOT NULL,
    scopes flex.scope [] NOT NULL,
    record_time_range tstzrange NOT NULL DEFAULT tstzrange(
        localtimestamp, null, '[)'
    ),
    recorded_by bigint NOT NULL DEFAULT current_identity(),
    CONSTRAINT fk_party_membership_party_id FOREIGN KEY (party_id)
    REFERENCES party (id),
    CONSTRAINT fk_party_membership_entity_id FOREIGN KEY (entity_id)
    REFERENCES entity (id),
    CONSTRAINT uk_party_membership_entity_party_id UNIQUE (party_id, entity_id)
);
-- noqa: enable=all

-- changeset flex:party-membership-capture-event runOnChange:true endDelimiter:--
CREATE OR REPLACE TRIGGER party_membership_event
AFTER INSERT OR DELETE ON party_membership
FOR EACH ROW
EXECUTE FUNCTION capture_event('party_membership');

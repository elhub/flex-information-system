--liquibase formatted sql
-- Manually managed file

--changeset flex:api-drop-event-wal2json-logical-replication-slot endDelimiter:-- runAlways:true
--requires the slot to not be in use
--https://stackoverflow.com/a/49727401
SELECT pg_drop_replication_slot('event_slot')
WHERE EXISTS (
        SELECT 1 FROM pg_replication_slots
        WHERE slot_name = 'event_slot'
            AND plugin = 'wal2json'
    );

--changeset flex:api-create-event-publication endDelimiter:-- runOnChange:true
--preconditions onFail:MARK_RAN
--precondition-sql-check expectedResult:0 SELECT count(*) FROM pg_publication WHERE pubname = 'event_insert'
--NOTE: publications MUST be created before creating replication slots that use them
--      Ref https://www.postgresql.org/message-id/20220805.130944.1989619924314333193.horikyota.ntt%40gmail.com
CREATE PUBLICATION event_insert
FOR TABLE flex.event
WITH (publish = 'insert');

--changeset flex:api-create-event-pgoutput-logical-replication-slot endDelimiter:-- runAlways:true
SELECT pg_create_logical_replication_slot('event_slot', 'pgoutput')
WHERE NOT EXISTS (
        SELECT 1 FROM pg_replication_slots
        WHERE slot_name = 'event_slot'
    );

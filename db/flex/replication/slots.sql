--liquibase formatted sql
-- Manually managed file

-- changeset flex:api-create-event-logical-replication-slot endDelimiter:-- runAlways:true
SELECT pg_create_logical_replication_slot('event_slot', 'wal2json')
WHERE NOT EXISTS (
        SELECT 1 FROM pg_replication_slots
        WHERE slot_name = 'event_slot'
    );

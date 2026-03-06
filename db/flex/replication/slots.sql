--liquibase formatted sql
-- Manually managed file

--changeset flex:api-drop-event-publication endDelimiter:-- runAlways:true
DROP PUBLICATION IF EXISTS event_insert;

--changeset flex:api-drop-event-replication-slot endDelimiter:-- runAlways:true
--requires the slot to not be in use
SELECT pg_drop_replication_slot('event_slot')
WHERE EXISTS (
    SELECT 1 FROM pg_replication_slots
    WHERE slot_name = 'event_slot'
);

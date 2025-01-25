SELECT pg_drop_replication_slot(slot_name)
FROM pg_replication_slots
WHERE slot_name = 'event_slot';

SELECT pg_create_logical_replication_slot('event_slot', 'wal2json');

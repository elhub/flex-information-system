--liquibase formatted sql
-- Manually managed file

-- changeset flex:api-create-event-logical-replication-slot endDelimiter:-- runAlways:true
SELECT pg_create_logical_replication_slot('event_slot', 'wal2json');

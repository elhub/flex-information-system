--liquibase formatted sql
-- Manually managed file

-- changeset flex:accounting-point-sync-create runOnChange:false endDelimiter:--
CREATE TABLE IF NOT EXISTS flex.accounting_point_sync (
    accounting_point_id bigint PRIMARY KEY,
    -- Keep track of last sync start timestamp to determine if a sync is currently running
    -- or if a sync has failed and needs to be retried
    last_started_at timestamptz,
    -- Keep track of last successful sync timestamp to determine if sync is needed
    last_synced_at timestamptz,
    -- Keep track of last event timestamp to determine if sync is needed
    last_event_at timestamptz,

    CONSTRAINT accounting_point_sync_accounting_point_fkey
    FOREIGN KEY (accounting_point_id)
    REFERENCES flex.accounting_point (id)
    ON DELETE CASCADE -- to keep the tables in sync
);

-- changeset flex:accounting-point-sync-insert-function runOnChange:true endDelimiter:--
CREATE OR REPLACE FUNCTION accounting_point_insert_sync()
RETURNS trigger
SECURITY DEFINER
LANGUAGE plpgsql
AS $$
BEGIN
    INSERT INTO flex.accounting_point_sync (accounting_point_id)
    VALUES (NEW.id)
    ON CONFLICT (accounting_point_id) DO NOTHING;
    RETURN NEW;
END;
$$;

-- changeset flex:accounting-point-sync-insert-trigger runOnChange:true endDelimiter:--
CREATE OR REPLACE TRIGGER accounting_point_insert_sync
AFTER INSERT ON flex.accounting_point
FOR EACH ROW
EXECUTE FUNCTION accounting_point_insert_sync();

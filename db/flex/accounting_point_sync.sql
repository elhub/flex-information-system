--liquibase formatted sql
-- Manually managed file

-- changeset flex:accounting-point-sync-create runOnChange:false endDelimiter:--
CREATE TABLE IF NOT EXISTS flex.accounting_point_sync (
    accounting_point_id bigint PRIMARY KEY,
    -- Keep track of last sync start timestamp to determine if a sync is currently running
    -- or if a sync has failed and needs to be retried
    last_sync_start timestamptz NULL,
    -- Keep track of last successful sync timestamp to determine if sync is needed
    last_synced_at timestamptz NULL,
    -- Keep track of local sync revisions to detect races
    version bigint NOT NULL DEFAULT 0,

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

-- changeset flex:accounting-point-sync-fill runAlways:false endDelimiter:--
MERGE INTO flex.accounting_point_sync AS target
USING flex.accounting_point AS source
    ON target.accounting_point_id = source.id
WHEN NOT MATCHED THEN
    INSERT (accounting_point_id) VALUES (source.id);

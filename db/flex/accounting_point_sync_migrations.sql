--liquibase formatted sql
-- Manually managed file

-- changeset flex:accounting-point-sync-fill runAlways:false endDelimiter:--
MERGE INTO flex.accounting_point_sync AS target
USING flex.accounting_point AS source
    ON target.accounting_point_id = source.id
WHEN NOT MATCHED THEN
    INSERT (accounting_point_id) VALUES (source.id);

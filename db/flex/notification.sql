--liquibase formatted sql
-- Manually managed file

-- changeset flex:notification-create runOnChange:false endDelimiter:;
CREATE TABLE IF NOT EXISTS notification (
    id bigint PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
    acknowledged boolean NOT NULL DEFAULT false,
    event_id bigint NOT NULL,
    party_id bigint NOT NULL,
    record_time_range tstzrange NOT NULL DEFAULT tstzrange(
        localtimestamp, null, '[)'
    ),
    recorded_by bigint NOT NULL DEFAULT 0,

    CONSTRAINT notification_party_id_fkey FOREIGN KEY (
        party_id
    ) REFERENCES party (id),
    UNIQUE (party_id, event_id)
);

-- changeset flex:notification-unique-update-trigger runOnChange:true endDelimiter:;
CREATE OR REPLACE TRIGGER notification_unique_update
BEFORE UPDATE ON notification
FOR EACH ROW
WHEN (OLD.acknowledged = true) -- noqa
EXECUTE FUNCTION utils.raise_sqlstate(
    'acknowledged notification can no longer be updated'
);

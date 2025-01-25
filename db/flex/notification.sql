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

CREATE OR REPLACE FUNCTION no_double_update()
RETURNS trigger
SECURITY DEFINER
LANGUAGE plpgsql
AS
$$
BEGIN
    RAISE sqlstate 'PT400' using
        message = 'acknowledged notification can no longer be updated';
    RETURN null;
END;
$$;

CREATE OR REPLACE TRIGGER notification_unique_update
BEFORE UPDATE ON notification
FOR EACH ROW
WHEN (OLD.acknowledged = true) -- noqa
EXECUTE FUNCTION no_double_update();

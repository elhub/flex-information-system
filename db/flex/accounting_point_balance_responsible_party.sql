-- relation linking accounting points to their balance responsible party
CREATE TABLE IF NOT EXISTS accounting_point_balance_responsible_party (
    id bigint PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
    accounting_point_id bigint NOT NULL,
    balance_responsible_party_id bigint NOT NULL,
    balance_responsible_party_party_type text GENERATED ALWAYS AS (
        'balance_responsible_party'
    ) STORED,
    valid_time_range tstzrange CHECK (
        valid_time_range IS null OR (
            lower(valid_time_range) IS NOT null
            AND lower_inc(valid_time_range)
            AND NOT upper_inc(valid_time_range)
        )
    ),
    record_time_range tstzrange NOT NULL DEFAULT tstzrange(
        localtimestamp, null, '[)'
    ),
    recorded_by bigint NOT NULL DEFAULT current_identity(),

    CONSTRAINT fk_accounting_point_balance_responsible_party_accounting_point
    FOREIGN KEY (
        accounting_point_id
    ) REFERENCES accounting_point (id),
    CONSTRAINT fk_accounting_point_balance_responsible_party_brp FOREIGN KEY (
        balance_responsible_party_id, balance_responsible_party_party_type
    ) REFERENCES party (id, type),
    CONSTRAINT accounting_point_balance_responsible_party_valid_time_overlap
    EXCLUDE USING gist (
        accounting_point_id WITH =, valid_time_range WITH &&
    ) WHERE (valid_time_range IS NOT null)
);

CREATE OR REPLACE TRIGGER
accounting_point_balance_responsible_party_timeline_midnight_aligned
AFTER INSERT OR UPDATE ON accounting_point_balance_responsible_party
FOR EACH ROW
EXECUTE FUNCTION timeline.midnight_aligned();

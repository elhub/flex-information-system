-- internal
-- This table stores the balance responsible party chosen by each energy
-- supplier in the different metering grid areas, in both possible directions.
CREATE TABLE IF NOT EXISTS retailer_balance_responsibility (
    id bigint PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
    metering_grid_area_id bigint NOT NULL,
    energy_supplier_id bigint NOT NULL,
    energy_supplier_party_type text GENERATED ALWAYS AS (
        'energy_supplier'
    ) STORED,
    balance_responsible_party_id bigint NOT NULL,
    balance_responsible_party_party_type text GENERATED ALWAYS AS (
        'balance_responsible_party'
    ) STORED,
    direction text NOT NULL CHECK (
        direction IN (
            'up',
            'down'
        )
    ),
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

    CONSTRAINT fk_retailer_balance_responsibility_metering_grid_area
    FOREIGN KEY (
        metering_grid_area_id
    ) REFERENCES metering_grid_area (id),

    CONSTRAINT fk_retailer_balance_responsibility_energy_supplier
    FOREIGN KEY (
        energy_supplier_id, energy_supplier_party_type
    ) REFERENCES party (id, type),
    CONSTRAINT fk_retailer_balance_responsibility_balance_responsible_party
    FOREIGN KEY (
        balance_responsible_party_id, balance_responsible_party_party_type
    ) REFERENCES party (id, type),

    CONSTRAINT retailer_balance_responsibility_valid_time_overlap
    EXCLUDE USING gist (
        metering_grid_area_id WITH =,
        energy_supplier_id WITH =,
        direction WITH =,
        valid_time_range WITH &&
    ) WHERE (valid_time_range IS NOT null)
);

CREATE OR REPLACE TRIGGER retailer_balance_responsibility_midnight_aligned
AFTER INSERT OR UPDATE ON retailer_balance_responsibility
FOR EACH ROW
EXECUTE FUNCTION timeline.midnight_aligned();

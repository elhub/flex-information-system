CREATE TABLE IF NOT EXISTS balance_responsible_party_metering_grid_area (
    id bigint PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
    balance_responsible_party_id bigint NOT NULL,
    balance_responsible_party_type text GENERATED ALWAYS AS (
        'balance_responsible_party'
    ) STORED,
    metering_grid_area_id text NOT NULL CHECK (
        validate_business_id(metering_grid_area_id, 'eic_x')
    ),

    UNIQUE (balance_responsible_party_id, metering_grid_area_id),

    CONSTRAINT brp_mga_balance_responsible_party_fkey
    FOREIGN KEY (
        balance_responsible_party_id, balance_responsible_party_type
    ) REFERENCES party (id, type),
    CONSTRAINT brp_mga_metering_grid_area_fkey
    FOREIGN KEY (metering_grid_area_id)
    REFERENCES metering_grid_area (business_id)
);

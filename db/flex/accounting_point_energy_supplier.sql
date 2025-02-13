-- relation linking accounting points to their energy supplier
CREATE TABLE IF NOT EXISTS accounting_point_energy_supplier (
    id bigint PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
    accounting_point_id bigint NOT NULL,
    energy_supplier_id bigint NOT NULL,
    energy_supplier_party_type text GENERATED ALWAYS AS (
        'energy_supplier'
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

    CONSTRAINT fk_accounting_point_energy_supplier_accounting_point
    FOREIGN KEY (
        accounting_point_id
    ) REFERENCES accounting_point (id),
    CONSTRAINT fk_accounting_point_energy_supplier_energy_supplier FOREIGN KEY (
        energy_supplier_id, energy_supplier_party_type
    ) REFERENCES party (id, type),
    CONSTRAINT accounting_point_energy_supplier_valid_time_overlap
    EXCLUDE USING gist (
        accounting_point_id WITH =, valid_time_range WITH &&
    ) WHERE (valid_time_range IS NOT null)
);

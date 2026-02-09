--liquibase formatted sql
-- Manually managed file

-- landing table for energy supplier balance responsibility data updates coming from eSett
-- changeset flex:energy-supplier-balance-responsibility-staging-create runOnChange:false endDelimiter:--
-- internal
-- This staging table stores the balance responsible party chosen by each energy
-- supplier in the different metering grid areas, as fetched from eSett.
-- Unlike energy_supplier_balance_responsibility, this table does not have
-- valid_time_range as it represents the current state from the external source.
CREATE TABLE IF NOT EXISTS energy_supplier_balance_responsibility_staging (
    id bigint PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
    metering_grid_area_name text NOT NULL,
    energy_supplier_name text NOT NULL,
    balance_responsible_party_name text NOT NULL,
    energy_direction text NOT NULL CHECK (
        energy_direction IN (
            'production',
            'consumption'
        )
    ),
    record_time_range tstzrange NOT NULL DEFAULT tstzrange(
        localtimestamp, null, '[)'
    ),
    recorded_by bigint NOT NULL DEFAULT current_identity(),

    CONSTRAINT uk_esbr_staging_mga_es_direction
    UNIQUE (metering_grid_area_name, energy_supplier_name, energy_direction)
);

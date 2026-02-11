--liquibase formatted sql
-- Manually managed file

-- landing table for energy supplier balance responsibility data updates
-- changeset flex:energy-supplier-balance-responsibility-staging-create runOnChange:false endDelimiter:--
-- stores the balance responsible party chosen by each energy supplier in the
-- different metering grid areas, as fetched from the external source
CREATE UNLOGGED TABLE IF NOT EXISTS
staging.energy_supplier_balance_responsibility (
    metering_grid_area_business_id text NOT NULL, -- EIC-Y
    energy_supplier_business_id text NOT NULL, -- GLN
    balance_responsible_party_business_id text NOT NULL, -- GLN
    energy_direction text NOT NULL,
    valid_time_range tstzrange,
    recorded_at timestamptz NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT esbr_staging_metering_grid_area_business_id_check CHECK (
        validate_business_id(metering_grid_area_business_id, 'eic_y')
    ),
    CONSTRAINT esbr_staging_energy_supplier_business_id_check CHECK (
        validate_business_id(energy_supplier_business_id, 'gln')
    ),
    CONSTRAINT esbr_staging_balance_responsible_party_business_id_check CHECK (
        validate_business_id(balance_responsible_party_business_id, 'gln')
    ),
    CONSTRAINT esbr_staging_energy_direction_check CHECK (
        energy_direction IN (
            'production',
            'consumption'
        )
    ),
    CONSTRAINT esbr_staging_valid_time_range_check CHECK (
        valid_time_range IS null OR (
            lower(valid_time_range) IS NOT null
            AND lower_inc(valid_time_range)
            AND NOT upper_inc(valid_time_range)
        )
    ),
    CONSTRAINT esbr_staging_valid_time_overlap
    EXCLUDE USING gist (
        metering_grid_area_business_id WITH =,
        energy_supplier_business_id WITH =,
        energy_direction WITH =,
        valid_time_range WITH &&
    ) WHERE (valid_time_range IS NOT null)
);

-- changeset flex:energy-supplier-balance-responsibility-staging-prepare runOnChange:false endDelimiter:--
-- empty the staging table before loading new data
CREATE OR REPLACE FUNCTION
staging.energy_supplier_balance_responsibility_prepare()
RETURNS void
SECURITY DEFINER
LANGUAGE sql
AS $$
    TRUNCATE TABLE staging.energy_supplier_balance_responsibility
    -- if foreign keys are defined on this table (SHOULD NOT), the prepare
    -- operation will fail and then we can trace this back to this reason
    RESTRICT;
$$;

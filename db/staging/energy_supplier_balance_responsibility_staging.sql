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
    valid_time_range tstzrange NOT NULL,

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
        lower(valid_time_range) IS NOT null
        AND lower_inc(valid_time_range)
        AND NOT upper_inc(valid_time_range)
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

-- changeset flex:energy-supplier-balance-responsibility-staging-view runOnChange:true endDelimiter:--
-- ESBR staging with foreign key resolved (business IDs turned into IDs)
CREATE OR REPLACE VIEW staging.energy_supplier_balance_responsibility_v AS (
    SELECT
        mga.id AS metering_grid_area_id,
        esp.id AS energy_supplier_id,
        brpp.id AS balance_responsible_party_id,
        stg.energy_direction,
        stg.valid_time_range
    FROM staging.energy_supplier_balance_responsibility AS stg
        INNER JOIN flex.metering_grid_area AS mga
            ON stg.metering_grid_area_business_id = mga.business_id
        INNER JOIN flex.party AS esp
            ON
                stg.energy_supplier_business_id = esp.business_id
                AND esp.type = 'energy_supplier'
        INNER JOIN flex.party AS brpp
            ON
                stg.balance_responsible_party_business_id = brpp.business_id
                AND brpp.type = 'balance_responsible_party'
);

-- changeset flex:energy-supplier-balance-responsibility-staging-update runOnChange:false endDelimiter:--
-- update the actual table with new data from the staging table
CREATE OR REPLACE FUNCTION
staging.energy_supplier_balance_responsibility_update()
RETURNS void
SECURITY DEFINER
LANGUAGE plpgsql
AS $$
BEGIN
    PERFORM set_config('flex.current_identity', '0', false);

    -- A timeline of balance responsibility is uniquely identified by the
    -- combination of MGA, ES, and energy direction. This timeline then contains
    -- records relating this combination to a BRP for a given time.

    -- The ESBR table represents the outdated timeline and the *target* of the
    -- update, whereas ESBR staging represents the updated timeline and the
    -- *source* of the update. The idea is that the source brings the target
    -- to a more recent state.

    -- What we want to do in the update operation is conceptually the same thing
    -- as in the load operation, i.e., empty table + full replace, as we trust
    -- the external source to give us the up-to-date correct timelines.
    -- *However*, we expect most of the data to be the same, with possibly some
    -- fixes in the past and/or the latest contracts being terminated and
    -- replaced with new BRP choices that came since the last time an update
    -- was run. This means that there is a lot of room for recycling records
    -- from one version of the timeline to the next one.

    -- In the general case, we can build an arbitrarily advanced logic to
    -- identify which records can be recycled (e.g., some common valid time,
    -- no conflict with several records, etc), but our hypothesis above means
    -- that most of the records will be "at the same place" in the outdated and
    -- updated timelines, i.e., they *start* at the same time.

    -- Our strategy is therefore the following:

    --   1. We delete all records in the outdated timeline that do not match
    --      another record's start time in the updated timeline. Such records
    --      represent stuff in the past that was corrected, so in this case the
    --      change could be anything. It is simpler to just drop the old record.

    --   2. We reuse records in the old timeline that start at the same time as
    --      a record in the new timeline, updating BRP and end of valid time.
    --      This case could be both a correction (correct dates but wrong BRP,
    --      or adjustment because of a shifted record) or just a contract being
    --      terminated (end of valid time changes from null to a defined date).

    --   3. We insert all the remaining records in the updated timeline that do
    --      not match any record's start time in the outdated timeline. This
    --      step is safe because the delete at step 1 and the corrections at
    --      step 2 made room for these records not to be in conflict with
    --      others. If the updated timeline is continuous, this also means that
    --      this insert will "fill all the gaps", and therefore after this step
    --      the target will describe a full, updated timeline.

    -- NB: Following the explanations above, the "key" to compare records in the
    -- update will thus be (MGA, ES, direction, valid time start). We don't care
    -- about BRP or end of valid time.

    -- defer (NB: not disable) timeline consistency checks until the update
    -- procedure is done, as we will be doing stateful operations in an
    -- arbitrary order that may temporarily violate them
    SET CONSTRAINTS ALL DEFERRED;

    -- step 1
    -- in PG>=17, this can be replaced with a simple
    -- 'WHEN NOT MATCHED BY SOURCE THEN DELETE' clause in the MERGE below
    DELETE FROM flex.energy_supplier_balance_responsibility AS flex_esbr
    WHERE NOT EXISTS (
        SELECT 1
        FROM staging.energy_supplier_balance_responsibility_v AS staging_esbr
        WHERE staging_esbr.metering_grid_area_id
        = flex_esbr.metering_grid_area_id
            AND staging_esbr.energy_supplier_id
            = flex_esbr.energy_supplier_id
            AND staging_esbr.energy_direction = flex_esbr.energy_direction
            AND lower(staging_esbr.valid_time_range)
            = lower(flex_esbr.valid_time_range)
    );

    MERGE INTO flex.energy_supplier_balance_responsibility AS flex_esbr
    USING staging.energy_supplier_balance_responsibility_v AS staging_esbr
        ON flex_esbr.metering_grid_area_id = staging_esbr.metering_grid_area_id
        AND flex_esbr.energy_supplier_id = staging_esbr.energy_supplier_id
        AND flex_esbr.energy_direction = staging_esbr.energy_direction
        AND lower(flex_esbr.valid_time_range)
        = lower(staging_esbr.valid_time_range)
    -- step 2
    WHEN MATCHED THEN
        UPDATE SET
            balance_responsible_party_id
            = staging_esbr.balance_responsible_party_id,
            valid_time_range = staging_esbr.valid_time_range
    -- step 3
    WHEN NOT MATCHED /* BY TARGET */ THEN
        INSERT (
            metering_grid_area_id,
            energy_supplier_id,
            energy_direction,
            balance_responsible_party_id,
            valid_time_range
        ) VALUES (
            staging_esbr.metering_grid_area_id,
            staging_esbr.energy_supplier_id,
            staging_esbr.energy_direction,
            staging_esbr.balance_responsible_party_id,
            staging_esbr.valid_time_range
        );
END;
$$;

-- changeset flex:energy-supplier-balance-responsibility-staging-finalise runOnChange:false endDelimiter:--
-- run some sanity checks on the loaded data and call the merge procedure
CREATE OR REPLACE FUNCTION
staging.energy_supplier_balance_responsibility_finalise()
RETURNS void
SECURITY DEFINER
LANGUAGE plpgsql
AS $$
DECLARE
    l_flex_count int;
    l_staging_count int;
BEGIN
    -- safety check: comparison of BRP relation counts
    -- if the staging count is too low compared to the target count, we may have
    -- a lot of deletes and the rest of the system may stop working correctly
    -- (potential sign of low quality in the input data)

    SELECT COUNT(*) INTO l_staging_count
    FROM staging.energy_supplier_balance_responsibility_v;

    SELECT COUNT(*) INTO l_flex_count
    FROM flex.energy_supplier_balance_responsibility;

    IF l_flex_count > 0 AND l_staging_count::numeric / l_flex_count < 0.8 THEN
        RAISE EXCEPTION 'The number of balance responsibility relations in staging is lower than 80% of the current amount, aborting update';
    END IF;

    PERFORM staging.energy_supplier_balance_responsibility_update();
END;
$$;

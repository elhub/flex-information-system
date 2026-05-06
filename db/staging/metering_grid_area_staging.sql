--liquibase formatted sql
-- Manually managed file

-- This file handles staging for MGA, MGA system operator and MGA price area,
-- which are synced together from the same external source. Prepare and finalise
-- steps are therefore shared, while update functions remain separate to ensure
-- clarity and readability.

-- staging unlogged tables

-- anything present in staging will have an active status after sync, while
-- anything missing from here will be set to inactive
-- changeset flex:metering-grid-area-staging-create runOnChange:false endDelimiter:--
CREATE UNLOGGED TABLE IF NOT EXISTS
staging.metering_grid_area (
    business_id text NOT NULL, -- EIC-Y
    name text NOT NULL,

    CONSTRAINT mga_staging_business_id_unique UNIQUE (business_id),
    CONSTRAINT mga_staging_business_id_check CHECK (
        flex.validate_business_id(business_id, 'eic_y')
    ),
    CONSTRAINT mga_staging_name_check CHECK (
        char_length(name) <= 128
    )
);

-- changeset flex:metering-grid-area-system-operator-staging-create runOnChange:false endDelimiter:--
CREATE UNLOGGED TABLE IF NOT EXISTS
staging.metering_grid_area_system_operator (
    metering_grid_area_business_id text NOT NULL, -- EIC-Y
    system_operator_business_id text NOT NULL, -- GLN
    valid_time_range tstzrange NOT NULL,

    CONSTRAINT mgaso_staging_metering_grid_area_business_id_check CHECK (
        flex.validate_business_id(metering_grid_area_business_id, 'eic_y')
    ),
    CONSTRAINT mgaso_staging_system_operator_business_id_check CHECK (
        flex.validate_business_id(system_operator_business_id, 'gln')
    ),
    CONSTRAINT mgaso_staging_valid_time_range_check CHECK (
        lower(valid_time_range) IS NOT null
        AND lower_inc(valid_time_range)
        AND NOT upper_inc(valid_time_range)
    ),
    CONSTRAINT mgaso_staging_valid_time_overlap
    EXCLUDE USING gist (
        metering_grid_area_business_id WITH =,
        valid_time_range WITH &&
    )
);

-- changeset flex:metering-grid-area-price-area-staging-create runOnChange:false endDelimiter:--
CREATE UNLOGGED TABLE IF NOT EXISTS
staging.metering_grid_area_price_area (
    metering_grid_area_business_id text NOT NULL, -- EIC-Y
    price_area text NOT NULL,
    valid_time_range tstzrange NOT NULL,

    CONSTRAINT mgapa_staging_metering_grid_area_business_id_check CHECK (
        flex.validate_business_id(metering_grid_area_business_id, 'eic_y')
    ),
    CONSTRAINT mgapa_staging_price_area_check CHECK (
        price_area IN ('NO1', 'NO2', 'NO3', 'NO4', 'NO5')
    ),
    CONSTRAINT mgapa_staging_valid_time_range_check CHECK (
        lower(valid_time_range) IS NOT null
        AND lower_inc(valid_time_range)
        AND NOT upper_inc(valid_time_range)
    ),
    CONSTRAINT mgapa_staging_valid_time_overlap
    EXCLUDE USING gist (
        metering_grid_area_business_id WITH =,
        valid_time_range WITH &&
    )
);

-- prepare function empties all three staging tables before loading new data

-- changeset flex:metering-grid-area-staging-prepare runOnChange:false endDelimiter:--
CREATE OR REPLACE FUNCTION
staging.metering_grid_area_prepare()
RETURNS void
SECURITY DEFINER
LANGUAGE sql
AS $$
    TRUNCATE TABLE
        staging.metering_grid_area,
        staging.metering_grid_area_system_operator,
        staging.metering_grid_area_price_area
    -- if foreign keys are defined on these tables (SHOULD NOT), the prepare
    -- operation will fail and then we can trace this back to this reason
    RESTRICT;
$$;

-- views to resolve foreign keys (to be queried when sync on the MGA table has
-- been completed, so that we take into account changes in the MGAs in staging)

-- changeset flex:metering-grid-area-system-operator-staging-view runOnChange:true endDelimiter:--
CREATE OR REPLACE VIEW staging.metering_grid_area_system_operator_v AS (
    SELECT
        mga.id AS metering_grid_area_id,
        so.id AS system_operator_id,
        stg.valid_time_range
    FROM staging.metering_grid_area_system_operator AS stg
        INNER JOIN flex.metering_grid_area AS mga
            ON
                stg.metering_grid_area_business_id = mga.business_id
                AND mga.status = 'active'
        INNER JOIN flex.party AS so
            ON
                stg.system_operator_business_id = so.business_id
                AND so.type = 'system_operator'
);

-- changeset flex:metering-grid-area-price-area-staging-view runOnChange:true endDelimiter:--
CREATE OR REPLACE VIEW staging.metering_grid_area_price_area_v AS (
    SELECT
        mga.id AS metering_grid_area_id,
        stg.price_area,
        stg.valid_time_range
    FROM staging.metering_grid_area_price_area AS stg
        INNER JOIN flex.metering_grid_area AS mga
            ON
                stg.metering_grid_area_business_id = mga.business_id
                AND mga.status = 'active'
);

-- update functions
-- see ESBR staging for detailed documentation about the MERGE procedures

-- changeset flex:metering-grid-area-staging-update runOnChange:false endDelimiter:--
CREATE OR REPLACE FUNCTION
staging.metering_grid_area_update()
RETURNS void
SECURITY DEFINER
LANGUAGE plpgsql
AS $$
BEGIN
    -- step 1: deactivate MGAs not in staging anymore
    -- TODO: refactor in PG17?
    UPDATE flex.metering_grid_area AS flex_mga
    SET status = 'inactive'
    WHERE NOT EXISTS (
        SELECT 1
        FROM staging.metering_grid_area AS staging_mga
        WHERE staging_mga.business_id = flex_mga.business_id
    );

    MERGE INTO flex.metering_grid_area AS flex_mga
    USING staging.metering_grid_area AS staging_mga
        ON flex_mga.business_id = staging_mga.business_id
    -- step 2: update/reactivate changed MGAs
    WHEN MATCHED AND (
        flex_mga.status = 'inactive'
        OR staging_mga.name IS DISTINCT FROM flex_mga.name
    ) THEN
        UPDATE SET
            name = staging_mga.name,
            status = 'active'
    -- step 3: insert new MGAs
    WHEN NOT MATCHED /* BY TARGET */ THEN
        INSERT (
            business_id,
            name
        ) VALUES (
            staging_mga.business_id,
            staging_mga.name
        );
END;
$$;

-- changeset flex:metering-grid-area-system-operator-staging-update runOnChange:false endDelimiter:--
CREATE OR REPLACE FUNCTION
staging.metering_grid_area_system_operator_update()
RETURNS void
SECURITY DEFINER
LANGUAGE plpgsql
AS $$
BEGIN
    -- step 1: delete records in flex not matched by start time in staging
    -- TODO: refactor in PG17
    DELETE FROM flex.metering_grid_area_system_operator AS flex_mgaso
    WHERE NOT EXISTS (
        SELECT 1
        FROM staging.metering_grid_area_system_operator_v AS staging_mgaso
        WHERE staging_mgaso.metering_grid_area_id
        = flex_mgaso.metering_grid_area_id
            AND lower(staging_mgaso.valid_time_range)
            = lower(flex_mgaso.valid_time_range)
    );

    MERGE INTO flex.metering_grid_area_system_operator AS flex_mgaso
    USING staging.metering_grid_area_system_operator_v AS staging_mgaso
        ON flex_mgaso.metering_grid_area_id
        = staging_mgaso.metering_grid_area_id
        AND lower(flex_mgaso.valid_time_range)
        = lower(staging_mgaso.valid_time_range)
    -- step 2: update changed records
    WHEN MATCHED AND (
        upper(staging_mgaso.valid_time_range)
        IS DISTINCT FROM upper(flex_mgaso.valid_time_range)
            OR staging_mgaso.system_operator_id != flex_mgaso.system_operator_id
    ) THEN
        UPDATE SET
            system_operator_id = staging_mgaso.system_operator_id,
            valid_time_range = staging_mgaso.valid_time_range
    -- step 3: insert new records
    WHEN NOT MATCHED /* BY TARGET */ THEN
        INSERT (
            metering_grid_area_id,
            system_operator_id,
            valid_time_range
        ) VALUES (
            staging_mgaso.metering_grid_area_id,
            staging_mgaso.system_operator_id,
            staging_mgaso.valid_time_range
        );
END;
$$;

-- changeset flex:metering-grid-area-price-area-staging-update runOnChange:false endDelimiter:--
CREATE OR REPLACE FUNCTION
staging.metering_grid_area_price_area_update()
RETURNS void
SECURITY DEFINER
LANGUAGE plpgsql
AS $$
BEGIN
    -- step 1: delete records in flex not matched by start time in staging
    -- TODO: refactor in PG17
    DELETE FROM flex.metering_grid_area_price_area AS flex_mgapa
    WHERE NOT EXISTS (
        SELECT 1
        FROM staging.metering_grid_area_price_area_v AS staging_mgapa
        WHERE staging_mgapa.metering_grid_area_id
        = flex_mgapa.metering_grid_area_id
            AND lower(staging_mgapa.valid_time_range)
            = lower(flex_mgapa.valid_time_range)
    );

    MERGE INTO flex.metering_grid_area_price_area AS flex_mgapa
    USING staging.metering_grid_area_price_area_v AS staging_mgapa
        ON flex_mgapa.metering_grid_area_id
        = staging_mgapa.metering_grid_area_id
        AND lower(flex_mgapa.valid_time_range)
        = lower(staging_mgapa.valid_time_range)
    -- step 2: update changed records
    WHEN MATCHED AND (
        upper(staging_mgapa.valid_time_range)
        IS DISTINCT FROM upper(flex_mgapa.valid_time_range)
            OR staging_mgapa.price_area != flex_mgapa.price_area
    ) THEN
        UPDATE SET
            price_area = staging_mgapa.price_area,
            valid_time_range = staging_mgapa.valid_time_range
    -- step 3: insert new records
    WHEN NOT MATCHED /* BY TARGET */ THEN
        INSERT (
            metering_grid_area_id,
            price_area,
            valid_time_range
        ) VALUES (
            staging_mgapa.metering_grid_area_id,
            staging_mgapa.price_area,
            staging_mgapa.valid_time_range
        );
END;
$$;

-- finalise function to run checks + all three updates in the correct order

-- changeset flex:metering-grid-area-staging-finalise runOnChange:false endDelimiter:--
CREATE OR REPLACE FUNCTION
staging.metering_grid_area_finalise()
RETURNS void
SECURITY DEFINER
LANGUAGE plpgsql
AS $$
DECLARE
    l_flex_count int;
    l_staging_count int;
BEGIN
    PERFORM set_config('flex.current_identity', '0', false);

    -- defer (NB: not disable) timeline consistency checks until the update
    -- procedure is done, as we will be doing stateful operations in an
    -- arbitrary order that may temporarily violate them
    SET CONSTRAINTS ALL DEFERRED;

    -- safety check: MGA count
    SELECT COUNT(*) INTO l_staging_count
    FROM staging.metering_grid_area;

    SELECT COUNT(*) INTO l_flex_count
    FROM flex.metering_grid_area
    WHERE status = 'active';

    IF l_flex_count > 0 AND l_staging_count::numeric / l_flex_count < 0.8 THEN
        RAISE EXCEPTION USING
            MESSAGE = 'The number of metering grid areas in staging is lower than 80% of the current active amount, aborting update';
    END IF;

    -- update for MGA is safe, we run it now to enable safety checks/updates
    -- for the relations depending on the updated state (use of the views)
    PERFORM staging.metering_grid_area_update();

    -- safety check: MGA-SO count
    SELECT COUNT(*) INTO l_staging_count
    FROM staging.metering_grid_area_system_operator_v;

    SELECT COUNT(*) INTO l_flex_count
    FROM flex.metering_grid_area_system_operator;

    IF l_flex_count > 0 AND l_staging_count::numeric / l_flex_count < 0.8 THEN
        RAISE EXCEPTION USING
            MESSAGE = 'The number of MGA-SO relations in staging is lower than 80% of the current amount, aborting update';
    END IF;

    -- safety check: MGA price area count
    SELECT COUNT(*) INTO l_staging_count
    FROM staging.metering_grid_area_price_area_v;

    SELECT COUNT(*) INTO l_flex_count
    FROM flex.metering_grid_area_price_area;

    IF l_flex_count > 0 AND l_staging_count::numeric / l_flex_count < 0.8 THEN
        RAISE EXCEPTION USING
            MESSAGE = 'The number of MGA price area relations in staging is lower than 80% of the current amount, aborting update';
    END IF;

    -- apply the remaining updates, now marked as safe
    PERFORM staging.metering_grid_area_system_operator_update();
    PERFORM staging.metering_grid_area_price_area_update();
END;
$$;

-- changeset flex:metering-grid-area-staging-grants runOnChange:false endDelimiter:;
GRANT INSERT, SELECT, UPDATE, DELETE
ON staging.metering_grid_area
TO flex_staging_structure_data;
GRANT INSERT, SELECT, UPDATE, DELETE
ON staging.metering_grid_area_system_operator
TO flex_staging_structure_data;
GRANT INSERT, SELECT, UPDATE, DELETE
ON staging.metering_grid_area_system_operator_v
TO flex_staging_structure_data;
GRANT INSERT, SELECT, UPDATE, DELETE
ON staging.metering_grid_area_price_area
TO flex_staging_structure_data;
GRANT INSERT, SELECT, UPDATE, DELETE
ON staging.metering_grid_area_price_area_v
TO flex_staging_structure_data;

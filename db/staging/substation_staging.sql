--liquibase formatted sql
-- Manually managed file

-- This file handles staging for substation_cluster, substation, and line,
-- which are synced together from the same external source. Prepare and finalise
-- steps are therefore shared, while update functions remain separate to ensure
-- clarity and readability.

-- staging unlogged tables

-- changeset flex:substation-cluster-staging-create runOnChange:false endDelimiter:--
CREATE UNLOGGED TABLE IF NOT EXISTS
staging.substation_cluster (
    mrid text NOT NULL,
    name text NOT NULL,
    lat numeric NOT NULL,
    lon numeric NOT NULL,

    CONSTRAINT substation_cluster_staging_mrid_unique UNIQUE (mrid),
    CONSTRAINT substation_cluster_staging_mrid_check CHECK (
        flex.validate_business_id(mrid, 'uuid')
    )
);

-- changeset flex:substation-staging-create runOnChange:false endDelimiter:--
CREATE UNLOGGED TABLE IF NOT EXISTS
staging.substation (
    mrid text NOT NULL,
    name text NOT NULL,
    kind text NOT NULL,
    primary_concessionaire text NOT NULL,
    substation_cluster_mrid text NOT NULL,
    voltage_levels numeric(9, 3) [] NOT NULL,
    lat numeric NOT NULL,
    lon numeric NOT NULL,

    CONSTRAINT substation_staging_mrid_unique UNIQUE (mrid),
    CONSTRAINT substation_staging_mrid_check CHECK (
        flex.validate_business_id(mrid, 'uuid')
    ),
    CONSTRAINT substation_staging_kind_check CHECK (
        kind IN ('coupling', 'junction', 'power', 'transformer')
    ),
    CONSTRAINT substation_staging_substation_cluster_mrid_check CHECK (
        flex.validate_business_id(substation_cluster_mrid, 'uuid')
    )
);

-- changeset flex:line-staging-create runOnChange:false endDelimiter:--
CREATE UNLOGGED TABLE IF NOT EXISTS
staging.line (
    mrid text NOT NULL,
    name text NOT NULL,
    from_substation_cluster_mrid text NOT NULL,
    to_substation_cluster_mrid text NOT NULL,

    CONSTRAINT line_staging_mrid_unique UNIQUE (mrid),
    CONSTRAINT line_staging_mrid_check CHECK (
        flex.validate_business_id(mrid, 'uuid')
    ),
    CONSTRAINT line_staging_from_substation_cluster_mrid_check CHECK (
        flex.validate_business_id(from_substation_cluster_mrid, 'uuid')
    ),
    CONSTRAINT line_staging_to_substation_cluster_mrid_check CHECK (
        flex.validate_business_id(to_substation_cluster_mrid, 'uuid')
    )
);

-- prepare function empties all three staging tables before loading new data

-- changeset flex:substation-staging-prepare runOnChange:false endDelimiter:--
CREATE OR REPLACE FUNCTION
staging.substation_prepare()
RETURNS void
SECURITY DEFINER
LANGUAGE sql
AS $$
    TRUNCATE TABLE
        staging.substation_cluster,
        staging.substation,
        staging.line
    -- if foreign keys are defined on these tables (SHOULD NOT), the prepare
    -- operation will fail and then we can trace this back to this reason
    RESTRICT;
$$;

-- views to resolve foreign keys (substation_cluster must be synced first so
-- that the views reflect the updated state)

-- changeset flex:substation-cluster-staging-view runOnChange:true endDelimiter:--
CREATE OR REPLACE VIEW staging.substation_cluster_v AS (
    SELECT
        sc.mrid,
        sc.name,
        ST_SETSRID(ST_MAKEPOINT(sc.lon, sc.lat), 4326) AS averaged_position,
        ST_BUFFER(
            COALESCE(
                ST_CONVEXHULL(
                    ST_COLLECT(
                        ST_SETSRID(ST_MAKEPOINT(sub.lon, sub.lat), 4326)
                    )
                ),
                ST_SETSRID(ST_MAKEPOINT(sc.lon, sc.lat), 4326)
            ),
            0.001
        ) AS area
    FROM staging.substation_cluster AS sc
        LEFT JOIN staging.substation AS sub
            ON sc.mrid = sub.substation_cluster_mrid
    GROUP BY sc.mrid, sc.name, sc.lat, sc.lon
);

-- changeset flex:substation-staging-view runOnChange:true endDelimiter:--
CREATE OR REPLACE VIEW staging.substation_v AS (
    SELECT
        stg.mrid,
        stg.name,
        stg.kind,
        stg.primary_concessionaire,
        sc.id AS substation_cluster_id,
        stg.voltage_levels,
        ST_SETSRID(ST_MAKEPOINT(stg.lon, stg.lat), 4326) AS position -- noqa
    FROM staging.substation AS stg
        INNER JOIN flex.substation_cluster AS sc
            ON stg.substation_cluster_mrid = sc.business_id
);

-- changeset flex:line-staging-view runOnChange:true endDelimiter:--
CREATE OR REPLACE VIEW staging.line_v AS (
    SELECT
        stg.mrid,
        stg.name,
        from_sc.id AS from_substation_cluster_id,
        to_sc.id AS to_substation_cluster_id,
        ST_MAKELINE(
            from_sc.averaged_position, to_sc.averaged_position
        ) AS line -- noqa
    FROM staging.line AS stg
        INNER JOIN flex.substation_cluster AS from_sc
            ON stg.from_substation_cluster_mrid = from_sc.business_id
        INNER JOIN flex.substation_cluster AS to_sc
            ON stg.to_substation_cluster_mrid = to_sc.business_id
);

-- update functions

-- changeset flex:substation-cluster-staging-update runOnChange:false endDelimiter:--
CREATE OR REPLACE FUNCTION
staging.substation_cluster_update()
RETURNS void
SECURITY DEFINER
LANGUAGE plpgsql
AS $$
BEGIN
    MERGE INTO flex.substation_cluster AS tgt
    USING staging.substation_cluster_v AS stg
        ON tgt.business_id = stg.mrid
    WHEN MATCHED AND (
        stg.name IS DISTINCT FROM tgt.name
        OR stg.averaged_position IS DISTINCT FROM tgt.averaged_position::geometry
        OR stg.area IS DISTINCT FROM tgt.area::geometry
    ) THEN
        UPDATE SET
            name = stg.name,
            averaged_position = stg.averaged_position,
            area = stg.area
    WHEN NOT MATCHED /* BY TARGET */ THEN
        INSERT (
            business_id,
            name,
            averaged_position,
            area
        ) VALUES (
            stg.mrid,
            stg.name,
            stg.averaged_position,
            stg.area
        );
END;
$$;

-- changeset flex:substation-staging-update runOnChange:false endDelimiter:--
CREATE OR REPLACE FUNCTION
staging.substation_update()
RETURNS void
SECURITY DEFINER
LANGUAGE plpgsql
AS $$
BEGIN
    MERGE INTO flex.substation AS tgt
    USING staging.substation_v AS stg
        ON tgt.business_id = stg.mrid
    WHEN MATCHED AND (
        stg.name IS DISTINCT FROM tgt.name
        OR stg.kind IS DISTINCT FROM tgt.kind
        OR stg.primary_concessionaire
        IS DISTINCT FROM tgt.primary_concessionaire
        OR stg.substation_cluster_id
        IS DISTINCT FROM tgt.substation_cluster_id
        OR stg.voltage_levels IS DISTINCT FROM tgt.voltage_levels
        OR stg.position IS DISTINCT FROM tgt.position
    ) THEN
        UPDATE SET
            name = stg.name,
            kind = stg.kind,
            primary_concessionaire = stg.primary_concessionaire,
            substation_cluster_id = stg.substation_cluster_id,
            voltage_levels = stg.voltage_levels,
            position = stg.position
    WHEN NOT MATCHED /* BY TARGET */ THEN
        INSERT (
            business_id,
            name,
            kind,
            primary_concessionaire,
            substation_cluster_id,
            voltage_levels,
            position
        ) VALUES (
            stg.mrid,
            stg.name,
            stg.kind,
            stg.primary_concessionaire,
            stg.substation_cluster_id,
            stg.voltage_levels,
            stg.position
        );
END;
$$;

-- changeset flex:line-staging-update runOnChange:false endDelimiter:--
CREATE OR REPLACE FUNCTION
staging.line_update()
RETURNS void
SECURITY DEFINER
LANGUAGE plpgsql
AS $$
BEGIN
    MERGE INTO flex.line AS tgt
    USING staging.line_v AS stg
        ON tgt.business_id = stg.mrid
    WHEN MATCHED AND (
        stg.name IS DISTINCT FROM tgt.name
        OR stg.from_substation_cluster_id
        IS DISTINCT FROM tgt.from_substation_cluster_id
        OR stg.to_substation_cluster_id
        IS DISTINCT FROM tgt.to_substation_cluster_id
    ) THEN
        UPDATE SET
            name = stg.name,
            from_substation_cluster_id = stg.from_substation_cluster_id,
            to_substation_cluster_id = stg.to_substation_cluster_id,
            line = stg.line
    WHEN NOT MATCHED /* BY TARGET */ THEN
        INSERT (
            business_id,
            name,
            from_substation_cluster_id,
            to_substation_cluster_id,
            line
        ) VALUES (
            stg.mrid,
            stg.name,
            stg.from_substation_cluster_id,
            stg.to_substation_cluster_id,
            stg.line
        );
END;
$$;

-- finalise function to run checks + all three updates in the correct order
-- changeset flex:substation-staging-finalise runOnChange:false endDelimiter:--
CREATE OR REPLACE FUNCTION
staging.substation_finalise()
RETURNS void
SECURITY DEFINER
LANGUAGE plpgsql
AS $$
DECLARE
    l_flex_count int;
    l_staging_count int;
BEGIN
    PERFORM set_config('flex.current_identity', '0', false);

    -- defer (NB: not disable) FK and uniqueness checks until the update
    -- procedure is done, as we will be doing stateful operations in an
    -- arbitrary order that may temporarily violate them
    SET CONSTRAINTS ALL DEFERRED;

    -- safety check: substation_cluster count
    SELECT COUNT(*) INTO l_staging_count
    FROM staging.substation_cluster;

    SELECT COUNT(*) INTO l_flex_count
    FROM flex.substation_cluster;

    IF l_flex_count > 0 AND l_staging_count::numeric / l_flex_count < 0.8 THEN
        RAISE EXCEPTION USING
            MESSAGE = 'The number of substation clusters in staging is lower than 80% of the current amount, aborting update';
    END IF;

    -- safety check: substation count
    SELECT COUNT(*) INTO l_staging_count
    FROM staging.substation;

    SELECT COUNT(*) INTO l_flex_count
    FROM flex.substation;

    IF l_flex_count > 0 AND l_staging_count::numeric / l_flex_count < 0.8 THEN
        RAISE EXCEPTION USING
            MESSAGE = 'The number of substations in staging is lower than 80% of the current amount, aborting update';
    END IF;

    -- safety check: line count
    SELECT COUNT(*) INTO l_staging_count
    FROM staging.line;

    SELECT COUNT(*) INTO l_flex_count
    FROM flex.line;

    IF l_flex_count > 0 AND l_staging_count::numeric / l_flex_count < 0.8 THEN
        RAISE EXCEPTION USING
            MESSAGE = 'The number of lines in staging is lower than 80% of the current amount, aborting update';
    END IF;

    -- delete records not present in staging, in dependency order (leaves first)
    -- to avoid FK violations when removing substation_cluster records
    DELETE FROM flex.line AS tgt
    WHERE NOT EXISTS (
        SELECT 1
        FROM staging.line AS stg
        WHERE stg.mrid = tgt.business_id
    );

    DELETE FROM flex.substation AS tgt
    WHERE NOT EXISTS (
        SELECT 1
        FROM staging.substation AS stg
        WHERE stg.mrid = tgt.business_id
    );

    DELETE FROM flex.substation_cluster AS tgt
    WHERE NOT EXISTS (
        SELECT 1
        FROM staging.substation_cluster AS stg
        WHERE stg.mrid = tgt.business_id
    );

    -- apply upserts, in dependency order (roots first) so that FK references
    -- are satisfied when inserting substations and lines
    PERFORM staging.substation_cluster_update();
    PERFORM staging.substation_update();
    PERFORM staging.line_update();
END;
$$;

-- changeset flex:substation-staging-grants runOnChange:true endDelimiter:;
GRANT INSERT, SELECT, UPDATE, DELETE
ON staging.substation_cluster
TO flex_staging_structure_data;
GRANT SELECT
ON staging.substation_cluster_v
TO flex_staging_structure_data;
GRANT INSERT, SELECT, UPDATE, DELETE
ON staging.substation
TO flex_staging_structure_data;
GRANT INSERT, SELECT, UPDATE, DELETE
ON staging.substation_v
TO flex_staging_structure_data;
GRANT INSERT, SELECT, UPDATE, DELETE
ON staging.line
TO flex_staging_structure_data;
GRANT INSERT, SELECT, UPDATE, DELETE
ON staging.line_v
TO flex_staging_structure_data;

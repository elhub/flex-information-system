--liquibase formatted sql
-- Manually managed file

-- changeset flex:accounting-point-grid-location-fresh-view runOnChange:true endDelimiter:--
-- fresh guesses for accounting point grid locations based on transformers'
-- and accounting points' geographical locations
CREATE OR REPLACE VIEW accounting_point_grid_location_fresh AS (
    SELECT
        ap.id AS accounting_point_id,
        'substation' AS object_type,
        closest_sub.business_id,
        closest_sub.name,
        -- system guess so we have no idea what the voltage level is
        0 AS nominal_voltage,
        'system' AS source,
        'guessed' AS quality
    FROM flex.accounting_point AS ap
        -- nearest neighbouring substation for each concerned accounting point
        CROSS JOIN LATERAL (
            SELECT sub.*
            FROM flex.substation AS sub
            -- for now we base guesses on active transformers only
            WHERE
                sub.kind = 'transformer'
                AND sub.status = 'active'
            ORDER BY sub.position <-> ap.location
            LIMIT 1
        ) AS closest_sub
    -- we cannot make a guess without the accounting point's location
    WHERE ap.location IS NOT NULL
    -- a location already set by a user should not be updated by the system
    AND NOT EXISTS (
        SELECT 1 FROM flex.accounting_point_grid_location AS apgl
        WHERE
            apgl.accounting_point_id = ap.id
            AND apgl.source != 'system'
    )
);

-- changeset flex:accounting-point-grid-location-sync-function runOnChange:true endDelimiter:--
-- synchronise the APGL table with the fresh grid location discovery
CREATE OR REPLACE FUNCTION accounting_point_grid_location_sync()
RETURNS void
SECURITY DEFINER
LANGUAGE plpgsql AS $$
BEGIN
    PERFORM set_config('flex.current_identity', '0', false);

    MERGE INTO flex.accounting_point_grid_location AS apgl
    USING flex.accounting_point_grid_location_fresh AS apglf -- fresh guesses
    ON apgl.accounting_point_id = apglf.accounting_point_id
    -- existing previous system guess has changed
    WHEN MATCHED
        AND apgl.source = 'system'
        AND (
            apgl.business_id IS DISTINCT FROM apglf.business_id
            OR apgl.name IS DISTINCT FROM apglf.name
        )
    THEN
        UPDATE SET
            object_type = apglf.object_type,
            business_id = apglf.business_id,
            name = apglf.name,
            nominal_voltage = apglf.nominal_voltage,
            source = apglf.source,
            quality = apglf.quality
    -- new guess for an accounting point without any previous guess
    WHEN NOT MATCHED BY TARGET THEN
        INSERT (
            accounting_point_id,
            object_type,
            business_id,
            name,
            nominal_voltage,
            source,
            quality
        ) VALUES (
            apglf.accounting_point_id,
            apglf.object_type,
            apglf.business_id,
            apglf.name,
            apglf.nominal_voltage,
            apglf.source,
            apglf.quality
        );
END;
$$;

-- changeset flex:accounting-point-grid-location-sync-job-schedule runOnChange:false endDelimiter:;
SELECT cron.schedule(
    'accounting-point-grid-location-sync',
    '27 3 * * *', -- every day at 03.27
    $$SELECT flex.accounting_point_grid_location_sync()$$
);

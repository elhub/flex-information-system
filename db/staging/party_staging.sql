--liquibase formatted sql
-- Manually managed file

-- landing table for party data updates coming from external sources
-- changeset flex:party-staging-create runOnChange:true endDelimiter:;
DROP TABLE IF EXISTS staging.party;
CREATE UNLOGGED TABLE IF NOT EXISTS staging.party (
    gln text,
    org text NOT NULL,
    name text NOT NULL,
    type text NOT NULL,

    CONSTRAINT party_staging_gln_check CHECK (
        validate_business_id(gln, 'gln')
    ),
    CONSTRAINT party_staging_org_check CHECK (
        validate_business_id(org, 'org')
    ),
    CONSTRAINT party_staging_type_check CHECK (
        type IN (
            'balance_responsible_party',
            'end_user',
            'energy_supplier',
            'market_operator',
            'service_provider',
            'system_operator',
            'third_party'
        )
    ),
    CONSTRAINT party_staging_gln_type_uk UNIQUE (gln, type)
);

-- grants must be given here due to the drop+recreate above
GRANT INSERT, SELECT, UPDATE, DELETE
ON staging.party
TO flex_staging_structure_data;

-- changeset flex:party-staging-prepare runOnChange:true endDelimiter:--
-- empty the staging table before loading new data
CREATE OR REPLACE FUNCTION staging.party_prepare()
RETURNS void
SECURITY DEFINER
LANGUAGE sql
AS $$
    TRUNCATE TABLE staging.party
    -- if foreign keys are defined on this table (SHOULD NOT), the prepare
    -- operation will fail and then we can trace this back to this reason
    RESTRICT;
$$;

-- changeset flex:party-staging-update runOnChange:true endDelimiter:--
-- update the actual table with new data from the staging table
CREATE OR REPLACE FUNCTION staging.party_update()
RETURNS void
SECURITY DEFINER
LANGUAGE plpgsql
AS $$
BEGIN
    PERFORM set_config('flex.current_identity', '0', false);

    -- Ensure all entities exists for the orgs
    MERGE INTO flex.entity AS e
    USING (
        SELECT DISTINCT ON (ps.org)
            ps.org,
            ps.name
        FROM staging.party AS ps
        ORDER BY ps.org asc, length(ps.name) asc
    ) AS src
        ON e.business_id = src.org
        AND e.business_id_type = 'org'
    WHEN NOT MATCHED BY TARGET THEN
        INSERT (name, type, business_id, business_id_type)
        VALUES (src.name, 'organisation', src.org, 'org');

    -- Ensure organisation party entries exists for all orgs
    MERGE INTO flex.party AS p
    USING (
        SELECT
            ps.org,
            ps.name,
            'organisation' AS type,
            e.id AS entity_id
        FROM (
            SELECT DISTINCT ON (ps.org)
                ps.org,
                ps.name
            FROM staging.party AS ps
            ORDER BY ps.org asc, length(ps.name) asc
        ) AS ps
        INNER JOIN flex.entity AS e
            ON e.business_id = ps.org
            AND e.business_id_type = 'org'
    ) AS src
        ON p.business_id = src.org
        AND p.business_id_type = 'org'
    WHEN NOT MATCHED THEN
        INSERT (business_id, business_id_type, entity_id, name, type, role, status)
        VALUES (src.org, 'org', src.entity_id, src.name, src.type, 'flex_' || src.type, 'active');


    MERGE INTO flex.party_staging AS flex_party
    USING staging.party AS stg
        ON flex_party.gln = stg.gln
        AND flex_party.type = stg.type
    WHEN MATCHED AND (
        stg.name IS DISTINCT FROM flex_party.name
            OR stg.org IS DISTINCT FROM flex_party.org
    ) THEN
        UPDATE SET
            name = stg.name,
            org = stg.org
    WHEN NOT MATCHED BY TARGET THEN
        INSERT (gln, org, name, type)
        VALUES (stg.gln, stg.org, stg.name, stg.type)
    WHEN NOT MATCHED BY SOURCE THEN
        DELETE;
END;
$$;

-- changeset flex:party-staging-finalise runOnChange:true endDelimiter:--
-- run some sanity checks on the loaded data and call the merge procedure
CREATE OR REPLACE FUNCTION staging.party_finalise()
RETURNS void
SECURITY DEFINER
LANGUAGE plpgsql
AS $$
DECLARE
    l_flex_count int;
    l_staging_count int;
BEGIN
    -- safety check: comparison of party counts
    -- if the staging count is too low compared to the target count, we may have
    -- a lot of deletes and the rest of the system may stop working correctly
    -- (potential sign of low quality in the input data)

    SELECT COUNT(*) INTO l_staging_count
    FROM staging.party;

    SELECT COUNT(*) INTO l_flex_count
    FROM flex.party_staging
    WHERE gln IS NOT NULL;

    IF l_flex_count > 0 AND l_staging_count::numeric / l_flex_count < 0.8 THEN
        RAISE EXCEPTION USING
            MESSAGE = 'The number of parties in staging is lower than 80% of the current amount, aborting update';
    END IF;

    PERFORM staging.party_update();
END;
$$;

-- changeset flex:party-staging-initial-merge-drop runOnChange:true endDelimiter:--
DROP FUNCTION IF EXISTS staging.party_initial_merge();

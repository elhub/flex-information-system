--liquibase formatted sql
-- Manually managed file


-- changeset flex:notice-party-missing runOnChange:true endDelimiter:--
-- new staging parties synced from external source but not in the system yet
CREATE OR REPLACE VIEW notice_party_missing
WITH (security_invoker = false) AS (
    SELECT
        p_fiso.id AS party_id,
        'no.elhub.flex.party.missing'::ltree AS type, -- noqa
        null AS source_resource, -- no source because the party does not exist yet
        null::bigint AS source_id,
        jsonb_build_object(
            'kind', 'notice.data.party.missing',
            'entity', jsonb_strip_nulls(
                jsonb_build_object(
                    'business_id', p_stg.org,
                    'business_id_type', e_stg.business_id_type,
                    'name', e_stg.name,
                    'type', e_stg.type
                )
            ),
            'party', jsonb_strip_nulls(
                jsonb_build_object(
                    'business_id', p_stg.gln,
                    'business_id_type', 'gln',
                    'entity_id', e_stg.id,
                    'name', p_stg.name,
                    'type', p_stg.type
                )
            )
        ) AS data, -- noqa
        md5(p_stg.gln::text || p_stg.type) AS deduplication_key -- noqa
    FROM flex.party_staging AS p_stg -- noqa
        LEFT JOIN flex.entity AS e_stg
            ON p_stg.org = e_stg.business_id
        -- warn all FISOs
        INNER JOIN flex.party AS p_fiso
            ON p_fiso.type = 'flexibility_information_system_operator'
    WHERE NOT EXISTS (
            SELECT 1 FROM flex.party AS p
            WHERE
                p.business_id = p_stg.gln
                AND p.type = p_stg.type
        )
);

-- changeset flex:notice-party-outdated runOnChange:true endDelimiter:--
-- parties already in the system, but with staging updates
CREATE OR REPLACE VIEW notice_party_outdated
WITH (security_invoker = false) AS (
    SELECT
        p_fiso.id AS party_id,
        'no.elhub.flex.party.outdated'::ltree AS type, -- noqa
        'party' AS source_resource,
        p.id AS source_id,
        jsonb_strip_nulls(
            jsonb_build_object(
                'kind', 'notice.data.party.outdated',
                'entity',
                (CASE
                    WHEN p_stg.org != e.business_id
                        THEN jsonb_build_object(
                                'business_id', p_stg.org,
                                'business_id_type', e_stg.business_id_type,
                                'name', e_stg.name,
                                'type', e_stg.type
                            )
                END),
                'party', jsonb_build_object(
                    'name', (
                        CASE WHEN p_stg.name != p.name THEN p_stg.name END
                    ),
                    'entity_id', (
                        CASE WHEN p_stg.org != e.business_id THEN e_stg.id END
                    )
                )
            )
        ) AS data, -- noqa
        md5(p.id::text) AS deduplication_key -- noqa
    FROM flex.party AS p -- noqa
        INNER JOIN flex.entity AS e
            ON p.entity_id = e.id
        INNER JOIN flex.party_staging AS p_stg
            ON
                p.business_id = p_stg.gln
                AND p.type = p_stg.type
                -- party has changed name or owning entity
                AND (p.name != p_stg.name OR e.business_id != p_stg.org)
        LEFT JOIN flex.entity AS e_stg
            ON p_stg.org = e_stg.business_id
        -- warn all FISOs
        INNER JOIN flex.party AS p_fiso
            ON p_fiso.type = 'flexibility_information_system_operator'
);

-- changeset flex:notice-party-residual runOnChange:true endDelimiter:--
-- parties deleted after sync, but still actually in the system
CREATE OR REPLACE VIEW notice_party_residual
WITH (security_invoker = false) AS (
    SELECT
        p_fiso.id AS party_id,
        'no.elhub.flex.party.residual'::ltree AS type, -- noqa
        'party' AS source_resource,
        p.id AS source_id,
        null::jsonb AS data, -- noqa
        md5(p.id::text) AS deduplication_key -- noqa
    FROM flex.party AS p -- noqa
        -- warn all FISOs
        INNER JOIN flex.party AS p_fiso
            ON p_fiso.type = 'flexibility_information_system_operator'
    WHERE
        p.business_id_type = 'gln'
        AND p.type != 'flexibility_information_system_operator'
        AND p.status != 'terminated'
        AND NOT EXISTS (
            SELECT 1 FROM flex.party_staging AS p_stg
            WHERE
                p_stg.gln = p.business_id
                AND p_stg.type = p.type
        )
);

-- changeset flex:notice-party-incompatible runOnChange:true endDelimiter:--
-- entity with access (ownership or membership) to parties of incompatible groups
CREATE OR REPLACE VIEW notice_party_incompatible
WITH (security_invoker = false) AS (
    -- (entity, party) pairs describing which parties a person has access to
    WITH
        entity_party_access AS (
            SELECT
                p.entity_id,
                p.id AS party_id
            FROM flex.party AS p
                INNER JOIN flex.entity AS e
                    ON p.entity_id = e.id
            WHERE p.status != 'terminated'
                AND e.type = 'person'
            UNION
            SELECT
                pm.entity_id,
                pm.party_id
            FROM flex.party_membership AS pm
                INNER JOIN flex.party AS p
                    ON pm.party_id = p.id
                INNER JOIN flex.entity AS e
                    ON pm.entity_id = e.id
            WHERE p.status != 'terminated'
                AND e.type = 'person'
        ),

        -- entity ID and, for each incompatible group, list of IDs of parties
        -- (for all entities having access to parties in both groups)
        -- TODO: implement a check for ES/BRP + SP
        entity_incompatible AS (
            SELECT
                epa.entity_id,
                jsonb_agg(p.id ORDER BY p.business_id)
                FILTER (WHERE p.type = 'system_operator') AS party_group_so,
                jsonb_agg(p.id ORDER BY p.business_id)
                FILTER (WHERE p.type = 'service_provider') AS party_group_sp
            FROM entity_party_access AS epa
                INNER JOIN flex.party AS p
                    ON epa.party_id = p.id
            WHERE p.type IN ('system_operator', 'service_provider')
            GROUP BY epa.entity_id
        )

    SELECT
        p_fiso.id AS party_id,
        'no.elhub.flex.party.incompatible'::ltree AS type, -- noqa
        'entity' AS source_resource,
        ei.entity_id AS source_id,
        jsonb_build_object(
            'kind', 'notice.data.party.incompatible',
            'entity', ei.entity_id,
            'party_groups', jsonb_build_array(
                ei.party_group_so,
                ei.party_group_sp
            )
        ) AS data, -- noqa
        md5(ei.entity_id::text) AS deduplication_key -- noqa
    FROM entity_incompatible AS ei
        -- warn all FISOs
        INNER JOIN flex.party AS p_fiso
            ON p_fiso.type = 'flexibility_information_system_operator'
    -- entity has at least one party in each incompatible party group
    WHERE ei.party_group_so IS NOT null
        AND ei.party_group_sp IS NOT null
);

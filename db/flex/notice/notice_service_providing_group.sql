--liquibase formatted sql
-- Manually managed file

-- changeset flex:notice-service-providing-group runAlways:true endDelimiter:--

-- SPG containing CUs with more than one BRP
-- TODO: consider energy direction in the check
--       (cf. https://elhub.atlassian.net/browse/FLEX-615)
DROP VIEW IF EXISTS notice_spg_brp_multiple CASCADE;
CREATE VIEW notice_spg_brp_multiple
WITH (security_invoker = false) AS (
    SELECT
        sp_id AS party_id,
        'no.elhub.flex.service_providing_group.balance_responsible_party.multiple'::ltree AS type, -- noqa
        'service_providing_group' AS source_resource,
        spg_id AS source_id,
        null::jsonb AS data -- noqa
    FROM (
        SELECT
            spg.id AS spg_id,
            spg.service_provider_id AS sp_id,
            count(DISTINCT apbrp.balance_responsible_party_id) AS nb_brp
        FROM flex.service_providing_group AS spg
            INNER JOIN flex.service_providing_group_membership AS spgm
                ON
                    spg.id = spgm.service_providing_group_id
                    AND spgm.valid_time_range @> current_timestamp
            INNER JOIN flex.controllable_unit AS cu
                ON spgm.controllable_unit_id = cu.id
            INNER JOIN
                flex.accounting_point_balance_responsible_party AS apbrp
                ON
                    cu.accounting_point_id = apbrp.accounting_point_id
                    AND apbrp.valid_time_range @> current_timestamp
        GROUP BY spg.id
    ) AS spg_brp_count
    WHERE nb_brp > 1
);

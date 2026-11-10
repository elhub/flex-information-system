--liquibase formatted sql
-- Manually managed file


-- changeset flex:notice-cso-no-active-users runOnChange:true endDelimiter:--
-- A CSO with active CUs but without active users should notice the FISO
CREATE OR REPLACE VIEW notice_cso_no_active_users
WITH (security_invoker = false) AS (
    SELECT
        p_fiso.id AS party_id,
        'no.elhub.flex.party.connecting_system_operator.no_active_users'::ltree AS type, -- noqa
        'party' AS source_resource,
        cso_no_users.cso_id AS source_id,
        null::jsonb AS data, -- noqa
        md5(cso_no_users.cso_id::text) AS deduplication_key -- noqa
    FROM (
        SELECT DISTINCT apso.system_operator_id AS cso_id
        FROM flex.controllable_unit AS cu
            INNER JOIN flex.accounting_point_system_operator AS apso
                ON
                    cu.accounting_point_id = apso.accounting_point_id
                    AND apso.valid_time_range @> current_timestamp
        WHERE
            cu.status != 'terminated' AND cu.status != 'inactive'
            AND NOT EXISTS (
                SELECT 1
                FROM flex.party_membership AS pm
                    INNER JOIN flex.entity AS e ON pm.entity_id = e.id
                WHERE
                    pm.party_id = apso.system_operator_id
                    AND e.type = 'person'
            )
    ) AS cso_no_users
        INNER JOIN flex.party AS p_fiso
            ON p_fiso.type = 'flexibility_information_system_operator'
);

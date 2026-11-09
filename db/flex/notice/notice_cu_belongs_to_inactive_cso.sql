--liquibase formatted sql
-- Manually managed file


-- changeset flex:notice-cu-belongs-to-inactive-cso runOnChange:true endDelimiter:--
-- The first CU connected to a CSO without active users notices the FISO (one notice per CSO)
CREATE OR REPLACE VIEW notice_cu_belongs_to_inactive_cso
WITH (security_invoker = false) AS (
    SELECT
        p_fiso.id AS party_id,
        'no.elhub.flex.controllable_unit.cso.no_active_users'::ltree AS type, -- noqa
        'controllable_unit' AS source_resource,
        cu_no_users.cu_id AS source_id,
        jsonb_build_object(
            'kind', 'notice.data.controllable_unit.cso.no_active_users',
            'controllable_unit_name', cu_no_users.cu_name,
            'connecting_system_operator_name', cso.name
        ) AS data, -- noqa
        md5(cu_no_users.cu_id::text) AS deduplication_key -- noqa
    FROM (
        SELECT DISTINCT ON (apso.system_operator_id)
            cu.id AS cu_id,
            cu.name AS cu_name,
            apso.system_operator_id AS cso_id
        FROM flex.controllable_unit AS cu
            INNER JOIN flex.accounting_point_system_operator AS apso
                ON
                    cu.accounting_point_id = apso.accounting_point_id
                    AND apso.valid_time_range @> current_timestamp
        WHERE
            cu.status != 'terminated'
            AND NOT EXISTS (
                SELECT 1
                FROM flex.party_membership AS pm
                    INNER JOIN flex.entity AS e ON pm.entity_id = e.id
                WHERE
                    pm.party_id = apso.system_operator_id
                    AND e.type = 'person'
            )
        ORDER BY apso.system_operator_id ASC, cu.id ASC
    ) AS cu_no_users
        INNER JOIN flex.party AS p_fiso
            ON p_fiso.type = 'flexibility_information_system_operator'
        INNER JOIN flex.party AS cso
            ON cu_no_users.cso_id = cso.id
);

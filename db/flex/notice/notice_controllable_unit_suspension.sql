--liquibase formatted sql
-- Manually managed file

-- changeset flex:notice-controllable-unit-suspension runAlways:true endDelimiter:--

DROP VIEW IF EXISTS notice_cus_not_active CASCADE;
-- suspension on CU no longer active
CREATE VIEW notice_cus_not_active
WITH (security_invoker = false) AS (
    SELECT
        cus.impacted_system_operator_id AS party_id,
        'no.elhub.flex.controllable_unit_suspension.not_active' AS type, -- noqa
        'controllable_unit_suspension' AS source_resource,
        cus.id AS source_id,
        null::jsonb AS data -- noqa
    FROM flex.controllable_unit_suspension AS cus
    WHERE NOT EXISTS (
        SELECT 1
        FROM flex.controllable_unit AS cu
        WHERE
            cu.id = cus.controllable_unit_id
            AND cu.status = 'active'
    )
);

DROP VIEW IF EXISTS notice_cus_lingering CASCADE;
-- inactive suspension
CREATE VIEW notice_cus_lingering
WITH (security_invoker = false) AS (
    SELECT
        cus.impacted_system_operator_id AS party_id,
        'no.elhub.flex.controllable_unit_suspension.lingering'
            AS type, -- noqa
        'controllable_unit_suspension' AS source_resource,
        cus.id AS source_id,
        null::jsonb AS data -- noqa
    FROM flex.controllable_unit_suspension AS cus
    WHERE
        lower(cus.record_time_range)
        < current_timestamp - interval '2 weeks'
);

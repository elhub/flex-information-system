--liquibase formatted sql
-- Manually managed file

-- changeset flex:controllable-unit-as-of-create runOnChange:true endDelimiter:--
CREATE OR REPLACE VIEW controllable_unit_as_of
WITH (security_invoker = false)
AS (
    -- service provider
    SELECT
        cusp.controllable_unit_id,
        cusp.service_provider_id AS party_id,
        'flex_service_provider' AS party_role,
        least(
            max(coalesce(upper(cusp.valid_time_range), 'infinity')),
            current_timestamp
        ) AS as_of
    FROM flex.controllable_unit_service_provider AS cusp
    GROUP BY cusp.controllable_unit_id, cusp.service_provider_id
    UNION ALL
    -- end user
    SELECT
        cueu.controllable_unit_id,
        cueu.end_user_id AS party_id,
        'flex_end_user' AS party_role,
        least(
            max(coalesce(upper(cueu.valid_time_range), 'infinity')),
            current_timestamp
        ) AS as_of
    FROM flex.controllable_unit_end_user AS cueu
    GROUP BY cueu.controllable_unit_id, cueu.end_user_id
    UNION ALL
    -- energy supplier
    SELECT
        cues.controllable_unit_id,
        cues.energy_supplier_id AS party_id,
        'flex_energy_supplier' AS party_role,
        least(
            max(coalesce(upper(cues.valid_time_range), 'infinity')),
            current_timestamp
        ) AS as_of
    FROM flex.controllable_unit_energy_supplier AS cues
    GROUP BY cues.controllable_unit_id, cues.energy_supplier_id
    UNION ALL
    -- balance responsible party
    SELECT
        cubrp.controllable_unit_id,
        cubrp.balance_responsible_party_id AS party_id,
        'flex_balance_responsible_party' AS party_role,
        least(
            max(coalesce(upper(cubrp.valid_time_range), 'infinity')),
            current_timestamp
        ) AS as_of
    FROM flex.controllable_unit_balance_responsible_party AS cubrp
    GROUP BY cubrp.controllable_unit_id, cubrp.balance_responsible_party_id
);

-- changeset flex:controllable-unit-as-of-grants runAlways:true endDelimiter:;
GRANT SELECT ON TABLE controllable_unit_as_of
TO flex_common;

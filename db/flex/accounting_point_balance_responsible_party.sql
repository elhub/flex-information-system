--liquibase formatted sql
-- Manually managed file

-- changeset flex:accounting-point-balance-responsible-party-create runOnChange:true endDelimiter:--
CREATE OR REPLACE VIEW accounting_point_balance_responsible_party
WITH (security_invoker = true) AS (
    SELECT
        ap_es.accounting_point_id,
        es_br.balance_responsible_party_id,
        es_br.energy_direction,
        row_number() OVER () AS id,
        (
            ap_es.valid_time_range
            * ap_mga.valid_time_range
            * es_br.valid_time_range
        ) AS valid_time_range
    FROM flex.accounting_point_energy_supplier AS ap_es -- noqa
        INNER JOIN flex.accounting_point_metering_grid_area AS ap_mga
            ON ap_mga.accounting_point_id = ap_es.accounting_point_id
                AND ap_es.valid_time_range && ap_mga.valid_time_range
        INNER JOIN flex.energy_supplier_balance_responsibility AS es_br
            ON es_br.metering_grid_area_id = ap_mga.metering_grid_area_id
                AND es_br.energy_supplier_id = ap_es.energy_supplier_id
                AND ap_es.valid_time_range && es_br.valid_time_range
);

-- changeset flex:accounting-point-balance-responsible-party-grants runOnChange:true endDelimiter:;
GRANT SELECT ON TABLE accounting_point_balance_responsible_party
TO flex_internal_event_notification;

GRANT SELECT ON TABLE accounting_point_balance_responsible_party
TO flex_common;

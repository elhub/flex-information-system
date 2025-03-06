-- name: LookupControllableUnit :many
SELECT
    cu.id,
    cu.business_id,
    cu.name,
    cu.accounting_point_id,
    apeu.end_user_id,
    (
        SELECT json_agg(row_to_json(tr))
        FROM (
            SELECT tr.id, tr.name, tr.details
            FROM api.technical_resource AS tr
            WHERE tr.controllable_unit_id = cu.id
        ) AS tr
    ) AS technical_resources
FROM api.controllable_unit AS cu
    INNER JOIN flex.accounting_point AS ap
        ON cu.accounting_point_id = ap.business_id
    INNER JOIN api.accounting_point_end_user AS apeu
        ON ap.id = apeu.accounting_point_id
WHERE apeu.valid_time_range @> current_timestamp
    AND apeu.end_user_id = @end_user_id
    AND (@business_id IS null OR cu.business_id = @business_id)
    AND (@accounting_point_id IS null OR cu.accounting_point_id = @accounting_point_id);

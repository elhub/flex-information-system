CREATE OR REPLACE FUNCTION controllable_unit_lookup(
    l_end_user_id bigint,
    l_business_id text,
    l_accounting_point_id text
)
RETURNS TABLE (
    id bigint,
    business_id text,
    name text,
    accounting_point_id text,
    end_user_id bigint,
    technical_resources jsonb
)
SECURITY DEFINER
LANGUAGE sql
AS $$ SELECT
    cu.id,
    cu.business_id::text,
    cu.name,
    cu.accounting_point_id,
    apeu.end_user_id,
    (
        SELECT json_agg(row_to_json(tr))
        FROM (
            SELECT tr.id, tr.name, tr.details
            FROM flex.technical_resource AS tr
            WHERE tr.controllable_unit_id = cu.id
        ) AS tr
    ) AS technical_resources
FROM flex.controllable_unit AS cu
    INNER JOIN flex.accounting_point AS ap
        ON cu.accounting_point_id = ap.business_id
    INNER JOIN flex.accounting_point_end_user AS apeu
        ON ap.id = apeu.accounting_point_id
WHERE apeu.valid_time_range @> current_timestamp
    AND apeu.end_user_id = l_end_user_id
    -- one of these fields must not be null
    AND (l_business_id IS NOT NULL OR l_accounting_point_id IS NOT NULL)
    -- if a field is null, ignore the filter
    AND (coalesce(cu.business_id = l_business_id::uuid, true))
    AND (coalesce(cu.accounting_point_id = l_accounting_point_id, true));
$$;

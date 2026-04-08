-- name: GetControllableUnitsByCUOrAPBusinessId :one
SELECT coalesce(jsonb_agg(row_to_json(cu)), '[]'::jsonb)::jsonb
FROM (
         SELECT
             cu.id,
             cu.business_id::text,
             cu.name,
             cu.start_date,
             (
                 SELECT coalesce(jsonb_agg(row_to_json(tr)), '[]'::jsonb)
                 FROM (
                          SELECT tr.id, tr.name
                          FROM flex.technical_resource AS tr
                          WHERE tr.controllable_unit_id = cu.id
                      ) AS tr
             ) AS technical_resources
         FROM flex.controllable_unit AS cu
                  INNER JOIN flex.accounting_point AS ap
                             ON cu.accounting_point_id = ap.id
                                 AND coalesce(cu.business_id = nullIf(@controllable_unit_business_id::text, '')::uuid, true)
                                 AND coalesce(ap.business_id = nullIf(@accounting_point_business_id::text, ''), true)
     ) as cu;

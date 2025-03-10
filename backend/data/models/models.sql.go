// Code generated by sqlc. DO NOT EDIT.
// versions:
//   sqlc v1.28.0
// source: models.sql

package models

import (
	"context"
)

const controllableUnitLookupInternal = `-- name: ControllableUnitLookupInternal :many
SELECT
    id::bigint,
    business_id::text,
    name::text,
    accounting_point_id::text,
    end_user_id::bigint,
    technical_resources::jsonb
FROM controllable_unit_lookup(
  $1, $2, $3
)
`

type ControllableUnitLookupInternalRow struct {
	ID                 int
	BusinessID         string
	Name               string
	AccountingPointID  string
	EndUserID          int
	TechnicalResources []byte
}

func (q *Queries) ControllableUnitLookupInternal(ctx context.Context, endUserID int, businessID string, accountingPointID string) ([]ControllableUnitLookupInternalRow, error) {
	rows, err := q.db.Query(ctx, controllableUnitLookupInternal, endUserID, businessID, accountingPointID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()
	var items []ControllableUnitLookupInternalRow
	for rows.Next() {
		var i ControllableUnitLookupInternalRow
		if err := rows.Scan(
			&i.ID,
			&i.BusinessID,
			&i.Name,
			&i.AccountingPointID,
			&i.EndUserID,
			&i.TechnicalResources,
		); err != nil {
			return nil, err
		}
		items = append(items, i)
	}
	if err := rows.Err(); err != nil {
		return nil, err
	}
	return items, nil
}

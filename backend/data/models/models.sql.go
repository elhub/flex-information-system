// Code generated by sqlc. DO NOT EDIT.
// versions:
//   sqlc v1.28.0
// source: models.sql

package models

import (
	"context"
)

const get1 = `-- name: Get1 :one
SELECT 1
`

// TODO: turn into a proper request once we override one endpoint
// (this file cannot be empty for sqlc to work properly)
func (q *Queries) Get1(ctx context.Context) (int32, error) {
	row := q.db.QueryRow(ctx, get1)
	var column_1 int32
	err := row.Scan(&column_1)
	return column_1, err
}

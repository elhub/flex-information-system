// Code generated by sqlc. DO NOT EDIT.
// versions:
//   sqlc v1.28.0
// source: models.sql

package models

import (
	"context"

	"github.com/jackc/pgx/v5/pgtype"
)

const getControllableUnitCreateNotificationRecipients = `-- name: GetControllableUnitCreateNotificationRecipients :many
SELECT unnest(
    array_remove(
        array[cu.connecting_system_operator_id, apeu.end_user_id], null
    )
)::bigint
FROM controllable_unit AS cu
INNER JOIN accounting_point AS ap ON ap.business_id = cu.accounting_point_id
LEFT JOIN accounting_point_end_user AS apeu ON apeu.accounting_point_id = ap.id
WHERE cu.id = $1
AND apeu.valid_time_range @> current_timestamp
`

func (q *Queries) GetControllableUnitCreateNotificationRecipients(ctx context.Context, resourceID int) ([]int, error) {
	rows, err := q.db.Query(ctx, getControllableUnitCreateNotificationRecipients, resourceID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()
	var items []int
	for rows.Next() {
		var column_1 int
		if err := rows.Scan(&column_1); err != nil {
			return nil, err
		}
		items = append(items, column_1)
	}
	if err := rows.Err(); err != nil {
		return nil, err
	}
	return items, nil
}

const getControllableUnitServiceProviderCreateNotificationRecipients = `-- name: GetControllableUnitServiceProviderCreateNotificationRecipients :many

SELECT unnest(
    array_remove(
        array[
            cusp.service_provider_id,
            cu.connecting_system_operator_id,
            apeu.end_user_id
        ],
        null
    )
)::bigint
FROM controllable_unit_service_provider AS cusp
INNER JOIN controllable_unit AS cu ON cu.id = cusp.controllable_unit_id
INNER JOIN accounting_point AS ap ON ap.business_id = cu.accounting_point_id
LEFT JOIN accounting_point_end_user AS apeu ON apeu.accounting_point_id = ap.id
WHERE cusp.id = $1
AND apeu.valid_time_range && tstzrange(cusp.valid_from, cusp.valid_to, '[)')
`

// not using history on CU-SP for CU ID and SP ID because they are stable
// not using history on CU because AP ID is stable
func (q *Queries) GetControllableUnitServiceProviderCreateNotificationRecipients(ctx context.Context, resourceID int) ([]int, error) {
	rows, err := q.db.Query(ctx, getControllableUnitServiceProviderCreateNotificationRecipients, resourceID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()
	var items []int
	for rows.Next() {
		var column_1 int
		if err := rows.Scan(&column_1); err != nil {
			return nil, err
		}
		items = append(items, column_1)
	}
	if err := rows.Err(); err != nil {
		return nil, err
	}
	return items, nil
}

const getControllableUnitServiceProviderUpdateDeleteNotificationRecipients = `-- name: GetControllableUnitServiceProviderUpdateDeleteNotificationRecipients :many
SELECT unnest(
    array[cusp.service_provider_id, cu.connecting_system_operator_id]
)::bigint
FROM controllable_unit_service_provider cusp
INNER JOIN controllable_unit cu ON cu.id = cusp.controllable_unit_id
WHERE cusp.id = $1
`

func (q *Queries) GetControllableUnitServiceProviderUpdateDeleteNotificationRecipients(ctx context.Context, resourceID int) ([]int, error) {
	rows, err := q.db.Query(ctx, getControllableUnitServiceProviderUpdateDeleteNotificationRecipients, resourceID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()
	var items []int
	for rows.Next() {
		var column_1 int
		if err := rows.Scan(&column_1); err != nil {
			return nil, err
		}
		items = append(items, column_1)
	}
	if err := rows.Err(); err != nil {
		return nil, err
	}
	return items, nil
}

const getControllableUnitUpdateNotificationRecipients = `-- name: GetControllableUnitUpdateNotificationRecipients :many

SELECT connecting_system_operator_id
FROM controllable_unit cu
WHERE cu.id = $1
AND cu.status != 'new'
UNION
SELECT service_provider_id
FROM controllable_unit_service_provider_history cusph
WHERE cusph.controllable_unit_id = $1
AND tstzrange(cusph.recorded_at, cusph.replaced_at, '[)') @> $2::timestamptz
AND tstzrange(cusph.valid_from, cusph.valid_to, '[)') @> $2::timestamptz
`

// not using history on CU because AP ID is stable
// not using history on AP because business ID is stable
// not using history on APEU because we take the latest knowledge we have to
//
//	identify who to notify
//
// current timestamp because we take the relevant end user at the moment the
// event is processed
func (q *Queries) GetControllableUnitUpdateNotificationRecipients(ctx context.Context, resourceID int, recordedAt pgtype.Timestamptz) ([]int, error) {
	rows, err := q.db.Query(ctx, getControllableUnitUpdateNotificationRecipients, resourceID, recordedAt)
	if err != nil {
		return nil, err
	}
	defer rows.Close()
	var items []int
	for rows.Next() {
		var connecting_system_operator_id int
		if err := rows.Scan(&connecting_system_operator_id); err != nil {
			return nil, err
		}
		items = append(items, connecting_system_operator_id)
	}
	if err := rows.Err(); err != nil {
		return nil, err
	}
	return items, nil
}

const getServiceProviderProductApplicationCommentNotificationRecipients = `-- name: GetServiceProviderProductApplicationCommentNotificationRecipients :many
SELECT unnest(array[sppa.service_provider_id, sppa.system_operator_id])::bigint
FROM service_provider_product_application sppa
JOIN service_provider_product_application_comment_history sppach
ON sppa.id = sppach.service_provider_product_application_id
WHERE sppach.service_provider_product_application_comment_id = $1
AND tstzrange(sppach.recorded_at, sppach.replaced_at, '[)') @> $2::timestamptz
AND sppach.visibility = 'any_party'
`

// not using SPPA history because SP and SO are stable
// using SPPA comment history because the visibility can change over time
func (q *Queries) GetServiceProviderProductApplicationCommentNotificationRecipients(ctx context.Context, resourceID int, recordedAt pgtype.Timestamptz) ([]int, error) {
	rows, err := q.db.Query(ctx, getServiceProviderProductApplicationCommentNotificationRecipients, resourceID, recordedAt)
	if err != nil {
		return nil, err
	}
	defer rows.Close()
	var items []int
	for rows.Next() {
		var column_1 int
		if err := rows.Scan(&column_1); err != nil {
			return nil, err
		}
		items = append(items, column_1)
	}
	if err := rows.Err(); err != nil {
		return nil, err
	}
	return items, nil
}

const getServiceProviderProductApplicationNotificationRecipients = `-- name: GetServiceProviderProductApplicationNotificationRecipients :many

SELECT unnest(array[system_operator_id, service_provider_id])::bigint
FROM service_provider_product_application_history
WHERE service_provider_product_application_id = $1
AND tstzrange(recorded_at, replaced_at, '[)') @> $2::timestamptz
`

// not using history on CU-SP for CU ID and SP ID because they are stable
// not using history on CU because AP ID is stable
// not using history on AP because business ID is stable
// not using history on APEU or CU-SP for end user ID because we take the
//
//	latest knowledge we have to identify who to notify and if it still
//	makes sense
//
// valid time check : notifying all end users that (up to the latest knowledge)
//
//	are in charge of the AP during at least a part of the CU-SP validity period
func (q *Queries) GetServiceProviderProductApplicationNotificationRecipients(ctx context.Context, resourceID int, recordedAt pgtype.Timestamptz) ([]int, error) {
	rows, err := q.db.Query(ctx, getServiceProviderProductApplicationNotificationRecipients, resourceID, recordedAt)
	if err != nil {
		return nil, err
	}
	defer rows.Close()
	var items []int
	for rows.Next() {
		var column_1 int
		if err := rows.Scan(&column_1); err != nil {
			return nil, err
		}
		items = append(items, column_1)
	}
	if err := rows.Err(); err != nil {
		return nil, err
	}
	return items, nil
}

const getServiceProvidingGroupCreateNotificationRecipients = `-- name: GetServiceProvidingGroupCreateNotificationRecipients :many
SELECT service_provider_id
FROM service_providing_group spg
WHERE spg.id = $1
`

func (q *Queries) GetServiceProvidingGroupCreateNotificationRecipients(ctx context.Context, resourceID int) ([]int, error) {
	rows, err := q.db.Query(ctx, getServiceProvidingGroupCreateNotificationRecipients, resourceID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()
	var items []int
	for rows.Next() {
		var service_provider_id int
		if err := rows.Scan(&service_provider_id); err != nil {
			return nil, err
		}
		items = append(items, service_provider_id)
	}
	if err := rows.Err(); err != nil {
		return nil, err
	}
	return items, nil
}

const getServiceProvidingGroupGridPrequalificationNotificationRecipients = `-- name: GetServiceProvidingGroupGridPrequalificationNotificationRecipients :many
SELECT impacted_system_operator_id
FROM service_providing_group_grid_prequalification spggp
WHERE spggp.id = $1
UNION
SELECT service_provider_id
FROM service_providing_group spg
WHERE spg.id = (
    SELECT service_providing_group_id
    FROM service_providing_group_grid_prequalification spggp
    WHERE spggp.id = $1
)
`

func (q *Queries) GetServiceProvidingGroupGridPrequalificationNotificationRecipients(ctx context.Context, resourceID int) ([]int, error) {
	rows, err := q.db.Query(ctx, getServiceProvidingGroupGridPrequalificationNotificationRecipients, resourceID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()
	var items []int
	for rows.Next() {
		var impacted_system_operator_id int
		if err := rows.Scan(&impacted_system_operator_id); err != nil {
			return nil, err
		}
		items = append(items, impacted_system_operator_id)
	}
	if err := rows.Err(); err != nil {
		return nil, err
	}
	return items, nil
}

const getServiceProvidingGroupMembershipNotificationRecipients = `-- name: GetServiceProvidingGroupMembershipNotificationRecipients :many
SELECT service_provider_id
FROM service_providing_group spg
WHERE spg.id = (
    SELECT distinct service_providing_group_id
    FROM service_providing_group_membership_history spgmh
    WHERE spgmh.service_providing_group_membership_id = $1
    AND tstzrange(spgmh.recorded_at, spgmh.replaced_at, '[]') @> $2::timestamptz
)
UNION
SELECT impacted_system_operator_id
FROM service_providing_group_grid_prequalification spggp
WHERE spggp.service_providing_group_id = (
    SELECT distinct service_providing_group_id
    FROM service_providing_group_membership_history spgmh
    WHERE spgmh.service_providing_group_membership_id = $1
    AND tstzrange(spgmh.recorded_at, spgmh.replaced_at, '[]') @> $2::timestamptz
)
`

func (q *Queries) GetServiceProvidingGroupMembershipNotificationRecipients(ctx context.Context, resourceID int, recordedAt pgtype.Timestamptz) ([]int, error) {
	rows, err := q.db.Query(ctx, getServiceProvidingGroupMembershipNotificationRecipients, resourceID, recordedAt)
	if err != nil {
		return nil, err
	}
	defer rows.Close()
	var items []int
	for rows.Next() {
		var service_provider_id int
		if err := rows.Scan(&service_provider_id); err != nil {
			return nil, err
		}
		items = append(items, service_provider_id)
	}
	if err := rows.Err(); err != nil {
		return nil, err
	}
	return items, nil
}

const getServiceProvidingGroupProductApplicationNotificationRecipients = `-- name: GetServiceProvidingGroupProductApplicationNotificationRecipients :many
SELECT spgpa.procuring_system_operator_id
FROM service_providing_group_product_application spgpa
WHERE spgpa.id = $1
UNION
SELECT spg.service_provider_id
FROM service_providing_group spg
WHERE spg.id = (
    SELECT service_providing_group_id
    FROM service_providing_group_product_application spgpa
    WHERE spgpa.id = $1
)
`

func (q *Queries) GetServiceProvidingGroupProductApplicationNotificationRecipients(ctx context.Context, resourceID int) ([]int, error) {
	rows, err := q.db.Query(ctx, getServiceProvidingGroupProductApplicationNotificationRecipients, resourceID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()
	var items []int
	for rows.Next() {
		var procuring_system_operator_id int
		if err := rows.Scan(&procuring_system_operator_id); err != nil {
			return nil, err
		}
		items = append(items, procuring_system_operator_id)
	}
	if err := rows.Err(); err != nil {
		return nil, err
	}
	return items, nil
}

const getServiceProvidingGroupUpdateNotificationRecipients = `-- name: GetServiceProvidingGroupUpdateNotificationRecipients :many
SELECT service_provider_id
FROM service_providing_group spg
WHERE spg.id = $1
UNION
SELECT connecting_system_operator_id
FROM controllable_unit cu
WHERE cu.id in (
    SELECT controllable_unit_id
    FROM service_providing_group_membership_history spgmh
    INNER JOIN service_providing_group_history spgh ON spgh.service_providing_group_id = spgmh.service_providing_group_id
    WHERE spgh.service_providing_group_id = $1
    AND spgh.status != 'new'
    AND tstzrange(spgh.recorded_at, spgh.replaced_at, '[)') @>  $2::timestamptz
    AND tstzrange(spgmh.recorded_at, spgmh.replaced_at, '[)') @>  $2::timestamptz
)
`

func (q *Queries) GetServiceProvidingGroupUpdateNotificationRecipients(ctx context.Context, resourceID int, recordedAt pgtype.Timestamptz) ([]int, error) {
	rows, err := q.db.Query(ctx, getServiceProvidingGroupUpdateNotificationRecipients, resourceID, recordedAt)
	if err != nil {
		return nil, err
	}
	defer rows.Close()
	var items []int
	for rows.Next() {
		var service_provider_id int
		if err := rows.Scan(&service_provider_id); err != nil {
			return nil, err
		}
		items = append(items, service_provider_id)
	}
	if err := rows.Err(); err != nil {
		return nil, err
	}
	return items, nil
}

const getSystemOperatorProductTypeCreateNotificationRecipients = `-- name: GetSystemOperatorProductTypeCreateNotificationRecipients :many
SELECT system_operator_id
FROM system_operator_product_type sopt
WHERE sopt.id = $1
UNION
SELECT party_id FROM party_history
WHERE type = 'service_provider'
AND status = 'active'
AND tstzrange(recorded_at, replaced_at, '[)') @> $2::timestamptz
`

func (q *Queries) GetSystemOperatorProductTypeCreateNotificationRecipients(ctx context.Context, resourceID int, recordedAt pgtype.Timestamptz) ([]int, error) {
	rows, err := q.db.Query(ctx, getSystemOperatorProductTypeCreateNotificationRecipients, resourceID, recordedAt)
	if err != nil {
		return nil, err
	}
	defer rows.Close()
	var items []int
	for rows.Next() {
		var system_operator_id int
		if err := rows.Scan(&system_operator_id); err != nil {
			return nil, err
		}
		items = append(items, system_operator_id)
	}
	if err := rows.Err(); err != nil {
		return nil, err
	}
	return items, nil
}

const getSystemOperatorProductTypeUpdateDeleteNotificationRecipients = `-- name: GetSystemOperatorProductTypeUpdateDeleteNotificationRecipients :many
SELECT system_operator_id
FROM system_operator_product_type sopt
WHERE sopt.id = $1
`

func (q *Queries) GetSystemOperatorProductTypeUpdateDeleteNotificationRecipients(ctx context.Context, resourceID int) ([]int, error) {
	rows, err := q.db.Query(ctx, getSystemOperatorProductTypeUpdateDeleteNotificationRecipients, resourceID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()
	var items []int
	for rows.Next() {
		var system_operator_id int
		if err := rows.Scan(&system_operator_id); err != nil {
			return nil, err
		}
		items = append(items, system_operator_id)
	}
	if err := rows.Err(); err != nil {
		return nil, err
	}
	return items, nil
}

const getTechnicalResourceNotificationRecipients = `-- name: GetTechnicalResourceNotificationRecipients :many
SELECT service_provider_id
FROM controllable_unit_service_provider_history cusph
WHERE cusph.controllable_unit_id = (
    SELECT controllable_unit_id
    FROM technical_resource_history trh
    WHERE trh.technical_resource_id = $1
    LIMIT 1
)
AND tstzrange(cusph.recorded_at, cusph.replaced_at, '[)') @> $2::timestamptz
AND tstzrange(cusph.valid_from, cusph.valid_to, '[)') @> $2::timestamptz
UNION
SELECT connecting_system_operator_id
FROM controllable_unit cu
WHERE cu.id = (
    SELECT controllable_unit_id
    FROM technical_resource_history trh
    WHERE trh.technical_resource_id = $1
    LIMIT 1
)
AND cu.status != 'new'
`

func (q *Queries) GetTechnicalResourceNotificationRecipients(ctx context.Context, resourceID int, recordedAt pgtype.Timestamptz) ([]int, error) {
	rows, err := q.db.Query(ctx, getTechnicalResourceNotificationRecipients, resourceID, recordedAt)
	if err != nil {
		return nil, err
	}
	defer rows.Close()
	var items []int
	for rows.Next() {
		var service_provider_id int
		if err := rows.Scan(&service_provider_id); err != nil {
			return nil, err
		}
		items = append(items, service_provider_id)
	}
	if err := rows.Err(); err != nil {
		return nil, err
	}
	return items, nil
}

const notify = `-- name: Notify :exec

INSERT INTO notification (event_id, party_id)
VALUES ($1, $2)
ON CONFLICT DO NOTHING
`

// other visibilities mean no notification (empty notified parties list) :
//   - 'same_party' leaves only the current party, removed from the list anyway
//   - 'same_party_type' leaves only different party types :
//   - FISO comments, SO and SP notified but they do not have the FISO type
//   - SO comments, SP notified but they do not have the SO type
//   - SP comments, SO notified but they do not have the SP type
func (q *Queries) Notify(ctx context.Context, eventID int, partyID int) error {
	_, err := q.db.Exec(ctx, notify, eventID, partyID)
	return err
}

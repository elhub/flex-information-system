-- name: GetSystemOperatorProductTypeCreateNotificationRecipients :many
SELECT system_operator_id
FROM system_operator_product_type sopt
WHERE sopt.id = @resource_id
UNION
SELECT party_id FROM party_history
WHERE type = 'service_provider'
AND status = 'active'
AND tstzrange(recorded_at, replaced_at, '[)') @> @recorded_at::timestamptz;

-- name: GetSystemOperatorProductTypeUpdateDeleteNotificationRecipients :many
SELECT system_operator_id
FROM system_operator_product_type sopt
WHERE sopt.id = @resource_id;

-- name: GetServiceProvidingGroupProductApplicationNotificationRecipients :many
SELECT spgpa.procuring_system_operator_id
FROM service_providing_group_product_application spgpa
WHERE spgpa.id = @resource_id
UNION
SELECT spg.service_provider_id
FROM service_providing_group spg
WHERE spg.id = (
    SELECT service_providing_group_id
    FROM service_providing_group_product_application spgpa
    WHERE spgpa.id = @resource_id
);

-- name: GetControllableUnitCreateNotificationRecipients :many
SELECT unnest(
    array_remove(
        array[cu.connecting_system_operator_id, apeu.end_user_id], null
    )
)::bigint
FROM controllable_unit AS cu
INNER JOIN accounting_point AS ap ON ap.business_id = cu.accounting_point_id
LEFT JOIN accounting_point_end_user AS apeu ON apeu.accounting_point_id = ap.id
WHERE cu.id = @resource_id
AND apeu.valid_time_range @> current_timestamp;
-- not using history on CU because AP ID is stable
-- not using history on AP because business ID is stable
-- not using history on APEU because we take the latest knowledge we have to
--   identify who to notify
-- current timestamp because we take the relevant end user at the moment the
-- event is processed

-- name: GetControllableUnitUpdateNotificationRecipients :many
SELECT connecting_system_operator_id
FROM controllable_unit cu
WHERE cu.id = @resource_id
AND cu.status != 'new'
UNION
SELECT service_provider_id
FROM controllable_unit_service_provider_history cusph
WHERE cusph.controllable_unit_id = @resource_id
AND tstzrange(cusph.recorded_at, cusph.replaced_at, '[)') @> @recorded_at::timestamptz
AND tstzrange(cusph.valid_from, cusph.valid_to, '[)') @> @recorded_at::timestamptz;

-- name: GetControllableUnitServiceProviderUpdateDeleteNotificationRecipients :many
SELECT unnest(
    array[cusp.service_provider_id, cu.connecting_system_operator_id]
)::bigint
FROM controllable_unit_service_provider cusp
INNER JOIN controllable_unit cu ON cu.id = cusp.controllable_unit_id
WHERE cusp.id = @resource_id;
-- not using history on CU-SP for CU ID and SP ID because they are stable
-- not using history on CU because AP ID is stable

-- name: GetControllableUnitServiceProviderCreateNotificationRecipients :many
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
WHERE cusp.id = @resource_id
AND apeu.valid_time_range && tstzrange(cusp.valid_from, cusp.valid_to, '[)');
-- not using history on CU-SP for CU ID and SP ID because they are stable
-- not using history on CU because AP ID is stable
-- not using history on AP because business ID is stable
-- not using history on APEU or CU-SP for end user ID because we take the
--   latest knowledge we have to identify who to notify and if it still
--   makes sense
-- valid time check : notifying all end users that (up to the latest knowledge)
--   are in charge of the AP during at least a part of the CU-SP validity period

-- name: GetServiceProviderProductApplicationNotificationRecipients :many
SELECT unnest(array[system_operator_id, service_provider_id])::bigint
FROM service_provider_product_application_history
WHERE service_provider_product_application_id = @resource_id
AND tstzrange(recorded_at, replaced_at, '[)') @> @recorded_at::timestamptz;

-- name: GetServiceProvidingGroupCreateNotificationRecipients :many
SELECT service_provider_id
FROM service_providing_group spg
WHERE spg.id = @resource_id;

-- name: GetServiceProvidingGroupUpdateNotificationRecipients :many
SELECT service_provider_id
FROM service_providing_group spg
WHERE spg.id = @resource_id
UNION
SELECT connecting_system_operator_id
FROM controllable_unit cu
WHERE cu.id in (
    SELECT controllable_unit_id
    FROM service_providing_group_membership_history spgmh
    INNER JOIN service_providing_group_history spgh ON spgh.service_providing_group_id = spgmh.service_providing_group_id
    WHERE spgh.service_providing_group_id = @resource_id
    AND spgh.status != 'new'
    AND tstzrange(spgh.recorded_at, spgh.replaced_at, '[)') @>  @recorded_at::timestamptz
    AND tstzrange(spgmh.recorded_at, spgmh.replaced_at, '[)') @>  @recorded_at::timestamptz
);

-- name: GetServiceProvidingGroupMembershipNotificationRecipients :many
SELECT service_provider_id
FROM service_providing_group spg
WHERE spg.id = (
    SELECT distinct service_providing_group_id
    FROM service_providing_group_membership_history spgmh
    WHERE spgmh.service_providing_group_membership_id = @resource_id
    AND tstzrange(spgmh.recorded_at, spgmh.replaced_at, '[]') @> @recorded_at::timestamptz
)
UNION
SELECT impacted_system_operator_id
FROM service_providing_group_grid_prequalification spggp
WHERE spggp.service_providing_group_id = (
    SELECT distinct service_providing_group_id
    FROM service_providing_group_membership_history spgmh
    WHERE spgmh.service_providing_group_membership_id = @resource_id
    AND tstzrange(spgmh.recorded_at, spgmh.replaced_at, '[]') @> @recorded_at::timestamptz
);

-- name: GetServiceProvidingGroupGridPrequalificationNotificationRecipients :many
SELECT impacted_system_operator_id
FROM service_providing_group_grid_prequalification spggp
WHERE spggp.id = @resource_id
UNION
SELECT service_provider_id
FROM service_providing_group spg
WHERE spg.id = (
    SELECT service_providing_group_id
    FROM service_providing_group_grid_prequalification spggp
    WHERE spggp.id = @resource_id
);

-- name: GetTechnicalResourceNotificationRecipients :many
SELECT service_provider_id
FROM controllable_unit_service_provider_history cusph
WHERE cusph.controllable_unit_id = (
    SELECT controllable_unit_id
    FROM technical_resource_history trh
    WHERE trh.technical_resource_id = @resource_id
    LIMIT 1
)
AND tstzrange(cusph.recorded_at, cusph.replaced_at, '[)') @> @recorded_at::timestamptz
AND tstzrange(cusph.valid_from, cusph.valid_to, '[)') @> @recorded_at::timestamptz
UNION
SELECT connecting_system_operator_id
FROM controllable_unit cu
WHERE cu.id = (
    SELECT controllable_unit_id
    FROM technical_resource_history trh
    WHERE trh.technical_resource_id = @resource_id
    LIMIT 1
)
AND cu.status != 'new';

-- name: GetServiceProviderProductApplicationCommentNotificationRecipients :many
SELECT unnest(array[sppa.service_provider_id, sppa.system_operator_id])::bigint
-- not using SPPA history because SP and SO are stable
FROM service_provider_product_application sppa
-- using SPPA comment history because the visibility can change over time
JOIN service_provider_product_application_comment_history sppach
ON sppa.id = sppach.service_provider_product_application_id
WHERE sppach.service_provider_product_application_comment_id = @resource_id
AND tstzrange(sppach.recorded_at, sppach.replaced_at, '[)') @> @recorded_at::timestamptz
AND sppach.visibility = 'any_party';
-- other visibilities mean no notification (empty notified parties list) :
--   - 'same_party' leaves only the current party, removed from the list anyway
--   - 'same_party_type' leaves only different party types :
--       + FISO comments, SO and SP notified but they do not have the FISO type
--       + SO comments, SP notified but they do not have the SO type
--       + SP comments, SO notified but they do not have the SP type

-- name: Notify :exec
INSERT INTO notification (event_id, party_id)
VALUES (@event_id, @party_id)
ON CONFLICT DO NOTHING;

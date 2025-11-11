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
        array[ap.system_operator_id, apeu.end_user_id], null
    )
)::bigint
FROM controllable_unit AS cu
INNER JOIN accounting_point AS ap
ON cu.accounting_point_id = ap.id
LEFT JOIN accounting_point_end_user AS apeu
ON apeu.accounting_point_id = cu.accounting_point_id
WHERE cu.id = @resource_id
AND apeu.valid_time_range @> current_timestamp;
-- not using history on CU because AP ID is stable
-- using the latest SO because AP.SO is not time-dependent
-- not using history on APEU because we take the latest knowledge we have to
--   identify who to notify
-- current timestamp because we take the relevant end user at the moment the
-- event is processed

-- name: GetControllableUnitUpdateNotificationRecipients :many
SELECT ap.system_operator_id
FROM controllable_unit AS cu
INNER JOIN accounting_point AS ap
ON cu.accounting_point_id = ap.id
WHERE cu.id = @resource_id
AND cu.status != 'new'
UNION
SELECT service_provider_id
FROM controllable_unit_service_provider_history cusph
WHERE cusph.controllable_unit_id = @resource_id
AND tstzrange(cusph.recorded_at, cusph.replaced_at, '[)') @> @recorded_at::timestamptz
AND cusph.valid_from IS NOT NULL
AND tstzrange(cusph.valid_from, cusph.valid_to, '[)') @> @recorded_at::timestamptz;

-- name: GetControllableUnitServiceProviderUpdateDeleteNotificationRecipients :many
SELECT DISTINCT unnest(
    array_remove(
        array[
            cusph.service_provider_id,
            ap.system_operator_id,
            apeu.end_user_id
        ],
        null
    )
)::bigint
FROM (
    SELECT
        cusph.service_provider_id, cusph.controllable_unit_id,
        cusph.valid_from, cusph.valid_to
    FROM controllable_unit_service_provider_history AS cusph
    WHERE cusph.controllable_unit_service_provider_id = @resource_id
    AND cusph.recorded_at <= @recorded_at
    ORDER BY cusph.recorded_at DESC LIMIT 2
) AS cusph
INNER JOIN controllable_unit AS cu ON cu.id = cusph.controllable_unit_id
INNER JOIN accounting_point AS ap ON cu.accounting_point_id = ap.id
LEFT JOIN accounting_point_end_user AS apeu ON apeu.accounting_point_id = cu.accounting_point_id
WHERE apeu.valid_time_range @> cusph.valid_from;
-- using history on CU-SP because EU depends on valid time
--   the subquery allows us to get only the 2 latest versions of CU-SP at the
--   time of the event (i.e., both versions before and after the update)
-- not using history on CU because AP ID is stable
-- using the latest SO because AP.SO is not time-dependent
-- just checking the start of the CU-SP valid time because functionally
--   speaking, this valid time should actually be aligned with the end user
--   valid time, so it is a way to avoid notifying people that are not really
--   concerned when we just correct a mistake

-- name: GetControllableUnitServiceProviderCreateNotificationRecipients :many
SELECT unnest(
    array_remove(
        array[
            cusp.service_provider_id,
            ap.system_operator_id,
            apeu.end_user_id
        ],
        null
    )
)::bigint
FROM controllable_unit_service_provider AS cusp
INNER JOIN controllable_unit AS cu ON cu.id = cusp.controllable_unit_id
INNER JOIN accounting_point AS ap ON cu.accounting_point_id = ap.id
LEFT JOIN accounting_point_end_user AS apeu ON apeu.accounting_point_id = cu.accounting_point_id
WHERE cusp.id = @resource_id
AND apeu.valid_time_range && tstzrange(cusp.valid_from, cusp.valid_to, '[)');
-- not using history on CU-SP for CU ID and SP ID because they are stable
-- not using history on CU because AP ID is stable
-- using the latest SO because AP.SO is not time-dependent
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

-- name: GetServiceProviderProductSuspensionNotificationRecipients :many
SELECT DISTINCT sppsh.service_provider_id::bigint
FROM service_provider_product_suspension_history AS sppsh
WHERE sppsh.service_provider_product_suspension_id = @resource_id
    AND tstzrange(sppsh.recorded_at, sppsh.replaced_at, '[]') @> @recorded_at::timestamptz
UNION ALL
SELECT DISTINCT sppah.system_operator_id::bigint
FROM service_provider_product_suspension_history AS sppsh
    INNER JOIN service_provider_product_application_history AS sppah
        ON sppsh.service_provider_id = sppah.service_provider_id
            AND sppsh.product_type_ids && sppah.product_type_ids
            AND tstzrange(sppah.recorded_at, sppah.replaced_at, '[)')
                @> @recorded_at::timestamptz
WHERE sppsh.service_provider_product_suspension_id = @resource_id
    AND tstzrange(sppsh.recorded_at, sppsh.replaced_at, '[]')
        @> @recorded_at::timestamptz;
-- using inclusive end record time here because SPPS is a deletable resource
-- (in order to notify delete events, we need to catch the last version in the
-- history, which ends right at the event timestamp, so its record time does
-- NOT contain it, so we do not catch it if we filter with exclusive end)

-- name: GetServiceProviderProductSuspensionCommentNotificationRecipients :many
SELECT DISTINCT
    unnest(
        ARRAY[sppsh.service_provider_id, sppsh.procuring_system_operator_id]
    )::bigint
-- using history because comments can be deleted
FROM service_provider_product_suspension_comment_history AS sppsch
    -- using history because suspensions can be deleted
    INNER JOIN service_provider_product_suspension_history AS sppsh
        ON sppsch.service_provider_product_suspension_id
            = sppsh.service_provider_product_suspension_id
            AND tstzrange(sppsh.recorded_at, sppsh.replaced_at, '[]')
                @> @recorded_at::timestamptz
WHERE sppsch.service_provider_product_suspension_comment_id = @resource_id
    AND tstzrange(sppsch.recorded_at, sppsch.replaced_at, '[]')
        @> @recorded_at::timestamptz
    -- private comments do not lead to notifications
    AND sppsch.visibility = 'any_involved_party';

-- name: GetServiceProvidingGroupCreateNotificationRecipients :many
SELECT service_provider_id
FROM service_providing_group spg
WHERE spg.id = @resource_id;

-- name: GetServiceProvidingGroupUpdateNotificationRecipients :many
SELECT service_provider_id
FROM service_providing_group spg
WHERE spg.id = @resource_id
UNION
SELECT ap.system_operator_id
FROM controllable_unit AS cu
INNER JOIN accounting_point AS ap ON cu.accounting_point_id = ap.id
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
AND cusph.valid_from IS NOT NULL
AND tstzrange(cusph.valid_from, cusph.valid_to, '[)') @> @recorded_at::timestamptz
UNION
SELECT ap.system_operator_id
FROM controllable_unit AS cu
INNER JOIN accounting_point AS ap ON cu.accounting_point_id = ap.id
WHERE cu.id = (
    SELECT controllable_unit_id
    FROM technical_resource_history trh
    WHERE trh.technical_resource_id = @resource_id
    LIMIT 1
)
AND cu.status != 'new';

-- name: GetServiceProviderProductApplicationCommentNotificationRecipients :many
SELECT DISTINCT
    unnest(ARRAY[sppa.service_provider_id, sppa.system_operator_id])::bigint
-- using SPPA comment history because visibility can change over time
FROM service_provider_product_application_comment_history AS sppach
    -- not using SPPA history because the resource cannot be deleted
    INNER JOIN service_provider_product_application AS sppa
        ON sppach.service_provider_product_application_id = sppa.id
WHERE sppach.service_provider_product_application_comment_id = @resource_id
    AND tstzrange(sppach.recorded_at, sppach.replaced_at, '[]')
        @> @recorded_at::timestamptz
    -- private comments do not lead to notifications
    AND sppach.visibility = 'any_involved_party';

-- name: Notify :exec
INSERT INTO notification (event_id, party_id)
VALUES (@event_id, @party_id)
ON CONFLICT DO NOTHING;

-- name: GetControllableUnitLookupNotificationRecipients :many
SELECT apeu.end_user_id::bigint
FROM controllable_unit AS cu
INNER JOIN accounting_point_end_user AS apeu ON apeu.accounting_point_id = cu.accounting_point_id
WHERE cu.id = @resource_id
AND apeu.valid_time_range @> @recorded_at::timestamptz;
-- not using history on CU because AP ID is stable
-- not using history on APEU because we take the latest knowledge we have to
--   identify who to notify

-- name: GetServiceProvidingGroupGridSuspensionNotificationRecipients :many
-- SP
SELECT spg.service_provider_id
FROM service_providing_group_grid_suspension_history AS spggsh
    INNER JOIN service_providing_group AS spg
        ON spggsh.service_providing_group_id = spg.id
    -- SPG cannot be deleted + SP does not change
WHERE spggsh.service_providing_group_grid_suspension_id = @resource_id
    AND tstzrange(spggsh.recorded_at, spggsh.replaced_at, '[]')
        @> @recorded_at::timestamptz
-- ISO
UNION ALL
SELECT spggph.impacted_system_operator_id
FROM service_providing_group_grid_suspension_history AS spggsh
    INNER JOIN service_providing_group_grid_prequalification_history AS spggph
        ON spggsh.service_providing_group_id = spggph.service_providing_group_id
WHERE spggsh.service_providing_group_grid_suspension_id = @resource_id
    AND tstzrange(spggsh.recorded_at, spggsh.replaced_at, '[]')
        @> @recorded_at::timestamptz
    AND tstzrange(spggph.recorded_at, spggph.replaced_at, '[]')
        @> @recorded_at::timestamptz
    AND notification.spg_grid_prequalification_ready_for_market_check(spggph)
-- PSO
UNION ALL
SELECT spgpah.procuring_system_operator_id
FROM service_providing_group_grid_suspension_history AS spggsh
    INNER JOIN service_providing_group_product_application_history AS spgpah
        ON spggsh.service_providing_group_id = spgpah.service_providing_group_id
WHERE spggsh.service_providing_group_grid_suspension_id = @resource_id
    AND tstzrange(spggsh.recorded_at, spggsh.replaced_at, '[]')
        @> @recorded_at::timestamptz
    AND tstzrange(spgpah.recorded_at, spgpah.replaced_at, '[]')
        @> @recorded_at::timestamptz
    AND notification.spg_product_application_ready_for_market_check(spgpah);

-- name: GetServiceProvidingGroupGridSuspensionCommentNotificationRecipients :many
SELECT DISTINCT
    unnest(ARRAY[
        spg.service_provider_id,
        spggsh.impacted_system_operator_id
    ])::bigint
-- using SPGGS(C) history because of visibility + possible deletion
FROM service_providing_group_grid_suspension_comment_history AS spggsch
    INNER JOIN service_providing_group_grid_suspension_history AS spggsh
        ON spggsch.service_providing_group_grid_suspension_id
            = spggsh.service_providing_group_grid_suspension_id
    -- SPG cannot be deleted + SP does not change
    INNER JOIN service_providing_group AS spg
        ON spggsh.service_providing_group_id = spg.id
WHERE spggsch.service_providing_group_grid_suspension_comment_id = @resource_id
    AND tstzrange(spggsch.recorded_at, spggsch.replaced_at, '[]')
        @> @recorded_at::timestamptz
    AND tstzrange(spggsh.recorded_at, spggsh.replaced_at, '[]')
        @> @recorded_at::timestamptz
    -- private comments do not lead to notifications
    AND spggsch.visibility = 'any_involved_party';

-- name: GetServiceProvidingGroupProductSuspensionNotificationRecipients :many
-- SP
SELECT spg.service_provider_id
FROM service_providing_group_product_suspension_history AS spgpsh
    INNER JOIN service_providing_group AS spg
        ON spgpsh.service_providing_group_id = spg.id
    -- SPG cannot be deleted + SP does not change
WHERE spgpsh.service_providing_group_product_suspension_id = @resource_id
    AND tstzrange(spgpsh.recorded_at, spgpsh.replaced_at, '[]')
        @> @recorded_at::timestamptz
-- PSO
UNION ALL
SELECT spgpah.procuring_system_operator_id
FROM service_providing_group_product_suspension_history AS spgpsh
    INNER JOIN service_providing_group_product_application_history AS spgpah
        ON spgpsh.service_providing_group_id = spgpah.service_providing_group_id
WHERE spgpsh.service_providing_group_product_suspension_id = @resource_id
    AND tstzrange(spgpsh.recorded_at, spgpsh.replaced_at, '[]')
        @> @recorded_at::timestamptz
    AND tstzrange(spgpah.recorded_at, spgpah.replaced_at, '[]')
        @> @recorded_at::timestamptz
    AND notification.spg_product_application_ready_for_market_check(spgpah);

-- name: GetServiceProvidingGroupProductSuspensionCommentNotificationRecipients :many
SELECT DISTINCT
    unnest(ARRAY[
        spg.service_provider_id,
        spgpsh.procuring_system_operator_id
    ])::bigint
-- using SPGPS(C) history because of visibility + possible deletion
FROM service_providing_group_product_suspension_comment_history AS spgpsch
    INNER JOIN service_providing_group_product_suspension_history AS spgpsh
        ON spgpsch.service_providing_group_product_suspension_id
            = spgpsh.service_providing_group_product_suspension_id
    -- SPG cannot be deleted + SP does not change
    INNER JOIN service_providing_group AS spg
        ON spgpsh.service_providing_group_id = spg.id
WHERE spgpsch.service_providing_group_product_suspension_comment_id = @resource_id
    AND tstzrange(spgpsch.recorded_at, spgpsch.replaced_at, '[]')
        @> @recorded_at::timestamptz
    AND tstzrange(spgpsh.recorded_at, spgpsh.replaced_at, '[]')
        @> @recorded_at::timestamptz
    -- private comments do not lead to notifications
    AND spgpsch.visibility = 'any_involved_party';

-- name: GetControllableUnitSuspensionNotificationRecipients :many
-- SP
SELECT cusp.service_provider_id
FROM controllable_unit_suspension_history AS cush
    INNER JOIN controllable_unit_service_provider AS cusp
        ON cush.controllable_unit_id = cusp.controllable_unit_id
WHERE cush.controllable_unit_suspension_id = @resource_id
    AND tstzrange(cush.recorded_at, cush.replaced_at, '[]')
        @> @recorded_at::timestamptz
    AND tstzrange(cusp.valid_from, cusp.valid_to, '[)')
        @> @recorded_at::timestamptz
-- ISO (= CSO)
UNION
SELECT ap.system_operator_id
FROM controllable_unit_suspension_history AS cush
    INNER JOIN controllable_unit AS cu
        ON cush.controllable_unit_id = cu.id
    INNER JOIN accounting_point AS ap
        ON cu.accounting_point_id = ap.id
WHERE cush.controllable_unit_suspension_id = @resource_id
    AND tstzrange(cush.recorded_at, cush.replaced_at, '[]')
        @> @recorded_at::timestamptz
-- PSO
UNION
SELECT spgpa.procuring_system_operator_id
FROM controllable_unit_suspension_history AS cush
    INNER JOIN service_providing_group_membership AS spgm
        ON cush.controllable_unit_id = spgm.controllable_unit_id
    INNER JOIN service_providing_group_product_application AS spgpa
        ON spgm.service_providing_group_id = spgpa.service_providing_group_id
WHERE cush.controllable_unit_suspension_id = @resource_id
    AND tstzrange(cush.recorded_at, cush.replaced_at, '[]')
        @> @recorded_at::timestamptz
    AND tstzrange(spgm.valid_from, spgm.valid_to, '[)')
        @> @recorded_at::timestamptz;

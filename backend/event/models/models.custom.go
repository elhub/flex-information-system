package models

import (
	"context"

	"github.com/jackc/pgx/v5/pgtype"
)

// GetNotificationRecipients returns a list of party IDs that should receive a notification for an event.
func (q *Queries) GetNotificationRecipients( //nolint:cyclop,funlen
	ctx context.Context,
	eventType string,
	sourceID int,
	subjectID int,
	recordedAt pgtype.Timestamptz,
) ([]int, error) {
	switch eventType {
	case "no.elhub.flex.controllable_unit.create":
		return q.GetControllableUnitCreateNotificationRecipients(ctx, recordedAt, sourceID)
	case "no.elhub.flex.controllable_unit.update":
		return q.GetControllableUnitUpdateNotificationRecipients(ctx, sourceID, recordedAt)
	case "no.elhub.flex.controllable_unit.lookup":
		return q.GetControllableUnitLookupNotificationRecipients(ctx, sourceID, recordedAt)
	case "no.elhub.flex.controllable_unit_suspension.create",
		"no.elhub.flex.controllable_unit_suspension.update",
		"no.elhub.flex.controllable_unit_suspension.delete":
		return q.GetControllableUnitSuspensionNotificationRecipients(ctx, subjectID, recordedAt)
	case "no.elhub.flex.controllable_unit_suspension_comment.create",
		"no.elhub.flex.controllable_unit_suspension_comment.update":
		return q.GetControllableUnitSuspensionCommentNotificationRecipients(ctx, subjectID, recordedAt)
	case "no.elhub.flex.controllable_unit_service_provider.create":
		return q.GetControllableUnitServiceProviderCreateNotificationRecipients(
			ctx, subjectID, recordedAt,
		)
	case "no.elhub.flex.controllable_unit_service_provider.update",
		"no.elhub.flex.controllable_unit_service_provider.delete":
		return q.GetControllableUnitServiceProviderUpdateDeleteNotificationRecipients(
			ctx, subjectID, recordedAt,
		)
	case "no.elhub.flex.system_operator_product_type.create":
		return q.GetSystemOperatorProductTypeCreateNotificationRecipients(ctx, sourceID, recordedAt)
	case "no.elhub.flex.system_operator_product_type.update":
		return q.GetSystemOperatorProductTypeUpdateNotificationRecipients(ctx, sourceID)
	case "no.elhub.flex.service_provider_product_application.create",
		"no.elhub.flex.service_provider_product_application.update":
		return q.GetServiceProviderProductApplicationNotificationRecipients(ctx, sourceID, recordedAt)
	case "no.elhub.flex.service_provider_product_application_comment.create",
		"no.elhub.flex.service_provider_product_application_comment.update":
		return q.GetServiceProviderProductApplicationCommentNotificationRecipients(
			ctx, subjectID, recordedAt,
		)
	case "no.elhub.flex.service_provider_product_suspension.create",
		"no.elhub.flex.service_provider_product_suspension.update",
		"no.elhub.flex.service_provider_product_suspension.delete":
		return q.GetServiceProviderProductSuspensionNotificationRecipients(ctx, sourceID, recordedAt)
	case "no.elhub.flex.service_provider_product_suspension_comment.create",
		"no.elhub.flex.service_provider_product_suspension_comment.update":
		return q.GetServiceProviderProductSuspensionCommentNotificationRecipients(
			ctx, recordedAt, subjectID,
		)
	case "no.elhub.flex.service_providing_group.create":
		return q.GetServiceProvidingGroupCreateNotificationRecipients(ctx, sourceID)
	case "no.elhub.flex.service_providing_group.update":
		return q.GetServiceProvidingGroupUpdateNotificationRecipients(ctx, sourceID, recordedAt)
	case "no.elhub.flex.service_providing_group_membership.create",
		"no.elhub.flex.service_providing_group_membership.update",
		"no.elhub.flex.service_providing_group_membership.delete":
		return q.GetServiceProvidingGroupMembershipNotificationRecipients(ctx, sourceID)
	case "no.elhub.flex.service_providing_group_product_application.create",
		"no.elhub.flex.service_providing_group_product_application.update":
		return q.GetServiceProvidingGroupProductApplicationNotificationRecipients(
			ctx, subjectID, sourceID,
		)
	case "no.elhub.flex.service_providing_group_grid_prequalification.create",
		"no.elhub.flex.service_providing_group_grid_prequalification.update":
		return q.GetServiceProvidingGroupGridPrequalificationNotificationRecipients(
			ctx, subjectID, sourceID,
		)
	case "no.elhub.flex.service_providing_group_grid_suspension.create",
		"no.elhub.flex.service_providing_group_grid_suspension.update",
		"no.elhub.flex.service_providing_group_grid_suspension.delete":
		return q.GetServiceProvidingGroupGridSuspensionNotificationRecipients(
			ctx, sourceID, subjectID, recordedAt,
		)
	case "no.elhub.flex.service_providing_group_grid_suspension_comment.create",
		"no.elhub.flex.service_providing_group_grid_suspension_comment.update":
		return q.GetServiceProvidingGroupGridSuspensionCommentNotificationRecipients(
			ctx, subjectID, recordedAt,
		)
	case "no.elhub.flex.service_providing_group_product_suspension.create",
		"no.elhub.flex.service_providing_group_product_suspension.update",
		"no.elhub.flex.service_providing_group_product_suspension.delete":
		return q.GetServiceProvidingGroupProductSuspensionNotificationRecipients(
			ctx, sourceID, subjectID, recordedAt,
		)
	case "no.elhub.flex.service_providing_group_product_suspension_comment.create",
		"no.elhub.flex.service_providing_group_product_suspension_comment.update":
		return q.GetServiceProvidingGroupProductSuspensionCommentNotificationRecipients(
			ctx, subjectID, recordedAt,
		)
	case "no.elhub.flex.technical_resource.create",
		"no.elhub.flex.technical_resource.update",
		"no.elhub.flex.technical_resource.delete":
		return q.GetTechnicalResourceNotificationRecipients(ctx, sourceID, recordedAt)
	default:
		return []int{}, nil
	}
}

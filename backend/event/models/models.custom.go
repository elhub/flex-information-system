package models

import (
	"context"

	"github.com/jackc/pgx/v5/pgtype"
)

// GetNotificationRecipients returns a list of party IDs that should receive a notification for an event.
func (q *Queries) GetNotificationRecipients( //nolint:cyclop
	ctx context.Context,
	eventType string,
	resourceID int,
	recordedAt pgtype.Timestamptz,
) ([]int, error) {
	switch eventType {
	case "no.elhub.flex.controllable_unit.create":
		return q.GetControllableUnitCreateNotificationRecipients(ctx, resourceID)
	case "no.elhub.flex.controllable_unit.update":
		return q.GetControllableUnitUpdateNotificationRecipients(ctx, resourceID, recordedAt)
	case "no.elhub.flex.controllable_unit_service_provider.create",
		"no.elhub.flex.controllable_unit_service_provider.update",
		"no.elhub.flex.controllable_unit_service_provider.delete":
		return q.GetControllableUnitServiceProviderNotificationRecipients(ctx, resourceID)
	case "no.elhub.flex.system_operator_product_type.create":
		return q.GetSystemOperatorProductTypeCreateNotificationRecipients(ctx, resourceID, recordedAt)
	case "no.elhub.flex.system_operator_product_type.update",
		"no.elhub.flex.system_operator_product_type.delete":
		return q.GetSystemOperatorProductTypeUpdateDeleteNotificationRecipients(ctx, resourceID)
	case "no.elhub.flex.service_provider_product_application.create",
		"no.elhub.flex.service_provider_product_application.update":
		return q.GetServiceProviderProductApplicationNotificationRecipients(ctx, resourceID, recordedAt)
	case "no.elhub.flex.service_provider_product_application_comment.create",
		"no.elhub.flex.service_provider_product_application_comment.update":
		return q.GetServiceProviderProductApplicationCommentNotificationRecipients(
			ctx, resourceID, recordedAt,
		)
	case "no.elhub.flex.service_providing_group.create":
		return q.GetServiceProvidingGroupCreateNotificationRecipients(ctx, resourceID)
	case "no.elhub.flex.service_providing_group.update":
		return q.GetServiceProvidingGroupUpdateNotificationRecipients(ctx, resourceID, recordedAt)
	case "no.elhub.flex.service_providing_group_membership.create",
		"no.elhub.flex.service_providing_group_membership.update",
		"no.elhub.flex.service_providing_group_membership.delete":
		return q.GetServiceProvidingGroupMembershipNotificationRecipients(ctx, resourceID, recordedAt)
	case "no.elhub.flex.service_providing_group_product_application.create",
		"no.elhub.flex.service_providing_group_product_application.update":
		return q.GetServiceProvidingGroupProductApplicationNotificationRecipients(ctx, resourceID)
	case "no.elhub.flex.service_providing_group_grid_prequalification.create",
		"no.elhub.flex.service_providing_group_grid_prequalification.update":
		return q.GetServiceProvidingGroupGridPrequalificationNotificationRecipients(ctx, resourceID)
	case "no.elhub.flex.technical_resource.create",
		"no.elhub.flex.technical_resource.update",
		"no.elhub.flex.technical_resource.delete":
		return q.GetTechnicalResourceNotificationRecipients(ctx, resourceID, recordedAt)
	default:
		return []int{}, nil
	}
}

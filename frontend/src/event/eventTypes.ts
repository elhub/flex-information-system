import { useTranslate } from "ra-core";
import type { TextKey } from "../intl/text";

// Groups event types so they can be filtered together, e.g. in the notification
// list. Set `category` on an event type below to include it in a category. A new
// category also needs a `notification.event_category.<name>` entry in intl/text.ts.
export const EVENT_CATEGORIES = ["comment"] as const;
type EventCategory = (typeof EVENT_CATEGORIES)[number];

type EventType = {
  id: string;
  label: TextKey;
  category?: EventCategory;
};

const eventTypes: EventType[] = [
  {
    id: "no.elhub.flex.controllable_unit_suspension_comment.create",
    label: "event_type.controllable_unit_suspension_comment.create",
    category: "comment",
  },
  {
    id: "no.elhub.flex.controllable_unit_suspension_comment.update",
    label: "event_type.controllable_unit_suspension_comment.update",
    category: "comment",
  },
  {
    id: "no.elhub.flex.service_provider_product_application_comment.create",
    label: "event_type.service_provider_product_application_comment.create",
    category: "comment",
  },
  {
    id: "no.elhub.flex.service_provider_product_application_comment.update",
    label: "event_type.service_provider_product_application_comment.update",
    category: "comment",
  },
  {
    id: "no.elhub.flex.service_provider_product_suspension_comment.create",
    label: "event_type.service_provider_product_suspension_comment.create",
    category: "comment",
  },
  {
    id: "no.elhub.flex.service_provider_product_suspension_comment.update",
    label: "event_type.service_provider_product_suspension_comment.update",
    category: "comment",
  },
  {
    id: "no.elhub.flex.service_providing_group_grid_prequalification_comment.create",
    label:
      "event_type.service_providing_group_grid_prequalification_comment.create",
    category: "comment",
  },
  {
    id: "no.elhub.flex.service_providing_group_grid_prequalification_comment.update",
    label:
      "event_type.service_providing_group_grid_prequalification_comment.update",
    category: "comment",
  },
  {
    id: "no.elhub.flex.service_providing_group_grid_suspension_comment.create",
    label: "event_type.service_providing_group_grid_suspension_comment.create",
    category: "comment",
  },
  {
    id: "no.elhub.flex.service_providing_group_grid_suspension_comment.update",
    label: "event_type.service_providing_group_grid_suspension_comment.update",
    category: "comment",
  },
  {
    id: "no.elhub.flex.service_providing_group_product_application_comment.create",
    label:
      "event_type.service_providing_group_product_application_comment.create",
    category: "comment",
  },
  {
    id: "no.elhub.flex.service_providing_group_product_application_comment.update",
    label:
      "event_type.service_providing_group_product_application_comment.update",
    category: "comment",
  },
  {
    id: "no.elhub.flex.service_providing_group_product_suspension_comment.create",
    label:
      "event_type.service_providing_group_product_suspension_comment.create",
    category: "comment",
  },
  {
    id: "no.elhub.flex.service_providing_group_product_suspension_comment.update",
    label:
      "event_type.service_providing_group_product_suspension_comment.update",
    category: "comment",
  },
  {
    id: "no.elhub.flex.accounting_point_grid_location.create",
    label: "event_type.accounting_point_grid_location.create",
  },
  {
    id: "no.elhub.flex.accounting_point_grid_location.update",
    label: "event_type.accounting_point_grid_location.update",
  },
  {
    id: "no.elhub.flex.controllable_unit.create",
    label: "event_type.controllable_unit.create",
  },
  {
    id: "no.elhub.flex.controllable_unit.update",
    label: "event_type.controllable_unit.update",
  },
  {
    id: "no.elhub.flex.controllable_unit_service_provider.create",
    label: "event_type.controllable_unit_service_provider.create",
  },
  {
    id: "no.elhub.flex.controllable_unit_service_provider.update",
    label: "event_type.controllable_unit_service_provider.update",
  },
  {
    id: "no.elhub.flex.controllable_unit_service_provider.delete",
    label: "event_type.controllable_unit_service_provider.delete",
  },
  {
    id: "no.elhub.flex.controllable_unit_suspension.create",
    label: "event_type.controllable_unit_suspension.create",
  },
  {
    id: "no.elhub.flex.controllable_unit_suspension.update",
    label: "event_type.controllable_unit_suspension.update",
  },
  {
    id: "no.elhub.flex.controllable_unit_suspension.delete",
    label: "event_type.controllable_unit_suspension.delete",
  },
  {
    id: "no.elhub.flex.notice.create",
    label: "event_type.notice.create",
  },
  {
    id: "no.elhub.flex.notice.update",
    label: "event_type.notice.update",
  },
  {
    id: "no.elhub.flex.party.create",
    label: "event_type.party.create",
  },
  {
    id: "no.elhub.flex.party.update",
    label: "event_type.party.update",
  },
  {
    id: "no.elhub.flex.party_membership.create",
    label: "event_type.party_membership.create",
  },
  {
    id: "no.elhub.flex.party_membership.delete",
    label: "event_type.party_membership.delete",
  },
  {
    id: "no.elhub.flex.service_provider_product_application.create",
    label: "event_type.service_provider_product_application.create",
  },
  {
    id: "no.elhub.flex.service_provider_product_application.update",
    label: "event_type.service_provider_product_application.update",
  },
  {
    id: "no.elhub.flex.service_provider_product_suspension.create",
    label: "event_type.service_provider_product_suspension.create",
  },
  {
    id: "no.elhub.flex.service_provider_product_suspension.update",
    label: "event_type.service_provider_product_suspension.update",
  },
  {
    id: "no.elhub.flex.service_provider_product_suspension.delete",
    label: "event_type.service_provider_product_suspension.delete",
  },
  {
    id: "no.elhub.flex.service_providing_group.create",
    label: "event_type.service_providing_group.create",
  },
  {
    id: "no.elhub.flex.service_providing_group.update",
    label: "event_type.service_providing_group.update",
  },
  {
    id: "no.elhub.flex.service_providing_group_grid_prequalification.create",
    label: "event_type.service_providing_group_grid_prequalification.create",
  },
  {
    id: "no.elhub.flex.service_providing_group_grid_prequalification.update",
    label: "event_type.service_providing_group_grid_prequalification.update",
  },
  {
    id: "no.elhub.flex.service_providing_group_grid_suspension.create",
    label: "event_type.service_providing_group_grid_suspension.create",
  },
  {
    id: "no.elhub.flex.service_providing_group_grid_suspension.update",
    label: "event_type.service_providing_group_grid_suspension.update",
  },
  {
    id: "no.elhub.flex.service_providing_group_grid_suspension.delete",
    label: "event_type.service_providing_group_grid_suspension.delete",
  },
  {
    id: "no.elhub.flex.service_providing_group_membership.create",
    label: "event_type.service_providing_group_membership.create",
  },
  {
    id: "no.elhub.flex.service_providing_group_membership.update",
    label: "event_type.service_providing_group_membership.update",
  },
  {
    id: "no.elhub.flex.service_providing_group_membership.delete",
    label: "event_type.service_providing_group_membership.delete",
  },
  {
    id: "no.elhub.flex.service_providing_group_product_application.create",
    label: "event_type.service_providing_group_product_application.create",
  },
  {
    id: "no.elhub.flex.service_providing_group_product_application.update",
    label: "event_type.service_providing_group_product_application.update",
  },
  {
    id: "no.elhub.flex.service_providing_group_product_application_attachment.create",
    label:
      "event_type.service_providing_group_product_application_attachment.create",
  },
  {
    id: "no.elhub.flex.service_providing_group_product_application_attachment.delete",
    label:
      "event_type.service_providing_group_product_application_attachment.delete",
  },
  {
    id: "no.elhub.flex.service_providing_group_product_suspension.create",
    label: "event_type.service_providing_group_product_suspension.create",
  },
  {
    id: "no.elhub.flex.service_providing_group_product_suspension.update",
    label: "event_type.service_providing_group_product_suspension.update",
  },
  {
    id: "no.elhub.flex.service_providing_group_product_suspension.delete",
    label: "event_type.service_providing_group_product_suspension.delete",
  },
  {
    id: "no.elhub.flex.system_operator_product_type.create",
    label: "event_type.system_operator_product_type.create",
  },
  {
    id: "no.elhub.flex.system_operator_product_type.update",
    label: "event_type.system_operator_product_type.update",
  },
  {
    id: "no.elhub.flex.technical_resource.create",
    label: "event_type.technical_resource.create",
  },
  {
    id: "no.elhub.flex.technical_resource.update",
    label: "event_type.technical_resource.update",
  },
  {
    id: "no.elhub.flex.technical_resource.delete",
    label: "event_type.technical_resource.delete",
  },
];

export const useEventTypeLabel = () => {
  const translate = useTranslate();
  return (id: string) => {
    const eventType = eventTypes.find((et) => et.id === id);
    return eventType ? translate(`text.${eventType.label}`) : id;
  };
};

export default eventTypes;

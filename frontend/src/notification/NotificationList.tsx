import { useGetIdentity, useTranslate } from "ra-core";
import { ResourceListLayout } from "../components/list/ResourceListLayout";
import type { ListColumn, ListFilterDef } from "../components/list/types";
import { BodyText } from "../components/ui";
import { toDateTimeString } from "../util";
import type { Notification } from "../generated-client";
import { EVENT_CATEGORIES, useEventTypeLabel } from "../event/eventTypes";
import {
  EVENT_CATEGORY_FILTER_SOURCE,
  useNotificationList,
} from "./useNotificationList";

const Dash = () => <BodyText size="small">-</BodyText>;

export const NotificationList = () => {
  const translate = useTranslate();
  const eventTypeLabel = useEventTypeLabel();
  const { list } = useNotificationList();
  const { data: identity } = useGetIdentity();

  const filters: ListFilterDef[] = [
    {
      type: "singleselect",
      source: "acknowledged",
      className: "w-32",
      label: translate("field.notification.acknowledged"),
      options: [
        { value: "true", label: translate("text.yes") },
        { value: "false", label: translate("text.no") },
      ],
    },
    {
      type: "multiselect",
      source: EVENT_CATEGORY_FILTER_SOURCE,
      className: "min-w-64",
      label: translate("text.notification.event_category"),
      options: EVENT_CATEGORIES.map((value) => ({
        value,
        label: translate(`text.notification.event_category.${value}`),
      })),
    },
  ];

  const isFiso =
    identity?.role === "flex_flexibility_information_system_operator";

  const columns: ListColumn<Notification>[] = [
    {
      header: translate("field.notification.id"),
      sortField: "id",
      sortType: "number",
      render: (n) => <BodyText size="small">{n.id}</BodyText>,
    },
    ...(isFiso
      ? [
          {
            header: translate("text.notification.recipient"),
            render: (n: Notification) =>
              n.party ? (
                <BodyText size="small">{n.party.name}</BodyText>
              ) : (
                <Dash />
              ),
          },
        ]
      : []),
    {
      header: translate("field.event.type"),
      render: (n) =>
        n.event ? (
          <BodyText size="small">{eventTypeLabel(n.event.type)}</BodyText>
        ) : (
          <Dash />
        ),
    },
    {
      header: translate("field.event.source"),
      render: (n) =>
        n.event ? <BodyText size="small">{n.event.source}</BodyText> : <Dash />,
    },
    {
      header: translate("field.notification.acknowledged"),
      render: (n) => (
        <BodyText size="small">
          {translate(n.acknowledged ? "text.yes" : "text.no")}
        </BodyText>
      ),
    },
    {
      header: translate("field.event.time"),
      sortField: "event(time)",
      sortType: "date",
      render: (n) =>
        n.event ? (
          <BodyText size="small">{toDateTimeString(n.event.time)}</BodyText>
        ) : (
          <Dash />
        ),
    },
  ];

  return (
    <ResourceListLayout
      title={translate("text.header_nav_notifications")}
      list={list}
      columns={columns}
      filters={filters}
      rowLink={(n) => `/notification/${n.id}/show`}
    />
  );
};

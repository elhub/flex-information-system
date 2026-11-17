import { useGetIdentity, useTranslate, useUpdate } from "ra-core";
import { useQueryClient } from "@tanstack/react-query";
import { Link as RouterLink } from "react-router-dom";
import {
  IconDots,
  IconCheckCircle,
  IconStopWatch15,
  IconValidationCheck,
} from "@elhub/ds-icons";
import { StatusBadge } from "../components/StatusBadge";
import { ResourceListLayout } from "../components/list/ResourceListLayout";
import type { ListColumn, ListFilterDef } from "../components/list/types";
import { BodyText, Button, Dropdown } from "../components/ui";
import { toDateTimeString } from "../util";
import type { Notification } from "../generated-client";
import { EVENT_CATEGORIES, useEventTypeLabel } from "../event/eventTypes";
import {
  EVENT_CATEGORY_FILTER_SOURCE,
  useNotificationList,
} from "./useNotificationList";

const RowActionsMenu = ({
  notification,
  canAcknowledge,
}: {
  notification: Notification;
  canAcknowledge: boolean;
}) => {
  const translate = useTranslate();
  const queryClient = useQueryClient();
  const [update] = useUpdate();
  const event = notification.event;
  const [, resource, resourceId] = event?.source.split("/") ?? [];
  const isDelete = event?.type.endsWith(".delete") ?? false;
  const hasResource = !!resource && !!resourceId;

  return (
    <div className="flex items-center justify-end gap-1">
      <Dropdown>
        <Button
          as={Dropdown.Toggle}
          variant="invisible"
          size="small"
          icon={IconDots}
          aria-label={translate(
            "text.resource_show_layout.more_actions_aria_label",
          )}
        />
        <Dropdown.Menu arrow placement="bottom-end">
          {canAcknowledge && !notification.acknowledged && (
            <>
              <Dropdown.Menu.GroupedList.Heading>
                {translate("text.resource_show_layout.actions_group_label")}
              </Dropdown.Menu.GroupedList.Heading>
              <Dropdown.Menu.GroupedList>
                <Dropdown.Menu.GroupedList.Item
                  onClick={() =>
                    update(
                      "notification",
                      {
                        id: notification.id,
                        data: { acknowledged: true },
                        previousData: notification,
                      },
                      {
                        mutationMode: "pessimistic",
                        onSuccess: () =>
                          queryClient.invalidateQueries({
                            queryKey: ["notification"],
                          }),
                      },
                    )
                  }
                >
                  <div className="flex items-center gap-2">
                    <IconValidationCheck />
                    {translate("text.notification.acknowledge")}
                  </div>
                </Dropdown.Menu.GroupedList.Item>
              </Dropdown.Menu.GroupedList>
              <Dropdown.Menu.Divider />
            </>
          )}
          <Dropdown.Menu.GroupedList.Heading>
            {translate("text.resource_show_layout.navigate_group_label")}
          </Dropdown.Menu.GroupedList.Heading>
          <Dropdown.Menu.GroupedList>
            <Dropdown.Menu.GroupedList.Item
              as={RouterLink}
              to={`/notification/${notification.id}/show`}
            >
              <div className="flex items-center gap-2">
                {translate("text.notification.details")}
              </div>
            </Dropdown.Menu.GroupedList.Item>
            {hasResource &&
              (isDelete ? (
                <Dropdown.Menu.GroupedList.Item
                  aria-disabled="true"
                  className="cursor-not-allowed opacity-60"
                  onClick={(e: React.MouseEvent) => e.preventDefault()}
                >
                  <div className="flex flex-col">
                    {translate("text.notification.go_to_resource")}
                    <BodyText size="small">
                      {translate("text.notification.resource_deleted")}
                    </BodyText>
                  </div>
                </Dropdown.Menu.GroupedList.Item>
              ) : (
                <Dropdown.Menu.GroupedList.Item
                  as={RouterLink}
                  to={`/${resource}/${resourceId}/show`}
                >
                  <div className="flex items-center gap-2">
                    {translate("text.notification.go_to_resource")}
                  </div>
                </Dropdown.Menu.GroupedList.Item>
              ))}
          </Dropdown.Menu.GroupedList>
        </Dropdown.Menu>
      </Dropdown>
    </div>
  );
};

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
      label: translate("text.notification.status"),
      options: [
        { value: "true", label: translate("text.notification.acknowledged") },
        {
          value: "false",
          label: translate("text.notification.not_acknowledged"),
        },
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
    {
      header: translate("text.notification.status"),
      render: (n) => (
        <StatusBadge
          status={n.acknowledged ? "approved" : "ongoing"}
          icon={n.acknowledged ? IconCheckCircle : IconStopWatch15}
          label={translate(
            n.acknowledged
              ? "text.notification.acknowledged"
              : "text.notification.not_acknowledged",
          )}
        />
      ),
    },
  ];

  return (
    <ResourceListLayout
      title={translate("text.header_nav_notifications")}
      list={list}
      columns={columns}
      filters={filters}
      rowActions={(n) => (
        <RowActionsMenu
          notification={n}
          canAcknowledge={
            identity?.partyID != null &&
            Number(n.party_id) === Number(identity.partyID)
          }
        />
      )}
    />
  );
};

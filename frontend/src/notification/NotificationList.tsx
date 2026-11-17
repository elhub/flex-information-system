import { useGetIdentity, useGetOne, useTranslate, useUpdate } from "ra-core";
import { useQueryClient } from "@tanstack/react-query";
import { Link as RouterLink } from "react-router-dom";
import {
  IconCheckCircle,
  IconStopWatch15,
  IconValidationCheck,
} from "@elhub/ds-icons";
import { StatusBadge } from "../components/StatusBadge";
import { ResourceListLayout } from "../components/list/ResourceListLayout";
import type { ListColumn, ListFilterDef } from "../components/list/types";
import { BodyText, Button, Tooltip } from "../components/ui";
import { toDateTimeString } from "../util";
import type { Notification } from "../generated-client";
import { EVENT_CATEGORIES, useEventTypeLabel } from "../event/eventTypes";
import {
  EVENT_CATEGORY_FILTER_SOURCE,
  useNotificationList,
} from "./useNotificationList";

const AcknowledgeAction = ({
  notification,
  canAcknowledge,
}: {
  notification: Notification;
  canAcknowledge: boolean;
}) => {
  const translate = useTranslate();
  const queryClient = useQueryClient();
  const [update, { isPending }] = useUpdate();

  if (!canAcknowledge || notification.acknowledged) {
    return null;
  }

  return (
    <Tooltip content={translate("text.notification.mark_as_acknowledged")}>
      <Button
        variant="invisible"
        size="small"
        icon={IconValidationCheck}
        aria-label={translate("text.notification.mark_as_acknowledged")}
        disabled={isPending}
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
      />
    </Tooltip>
  );
};

const Dash = () => <BodyText size="small">-</BodyText>;

const SourceButton = ({ notification }: { notification: Notification }) => {
  const translate = useTranslate();
  const event = notification.event;
  const [, resource, resourceId] = event?.source.split("/") ?? [];
  const isDeleteEvent = event?.type.endsWith(".delete") ?? false;
  const hasSource = !!resource && !!resourceId;

  const { error } = useGetOne(
    resource ?? "",
    { id: resourceId },
    {
      enabled: hasSource && !isDeleteEvent,
      retry: false,
      refetchOnWindowFocus: false,
    },
  );

  if (!event || !hasSource) {
    return <Dash />;
  }

  const label = translate(`text.notification.source.${resource}`, {
    _: translate("text.notification.resource"),
  });

  // PostgREST answers 406 when a single-object request matches no row (also
  // when the row is hidden by access rules), 404 for unknown routes.
  const errorStatus = (error as { status?: number } | null)?.status;
  const isGone = isDeleteEvent || errorStatus === 404 || errorStatus === 406;

  if (isGone) {
    return (
      <Tooltip content={translate("text.notification.resource_deleted")}>
        <span className="inline-block">
          <Button variant="primary" size="small" disabled>
            {label}
          </Button>
        </span>
      </Tooltip>
    );
  }

  return (
    <Button
      as={RouterLink}
      to={`/${resource}/${resourceId}/show`}
      variant="primary"
      size="small"
    >
      {label}
    </Button>
  );
};

export const NotificationList = () => {
  const translate = useTranslate();
  const eventTypeLabel = useEventTypeLabel();
  const { list } = useNotificationList();
  const { data: identity } = useGetIdentity();

  const filters: ListFilterDef[] = [
    {
      type: "singleselect",
      source: "acknowledged",
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
      header: translate("text.resource_show_layout.navigate_group_label"),
      render: (n) => <SourceButton notification={n} />,
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
    {
      header: translate("text.notification.acknowledge"),
      render: (n) => (
        <AcknowledgeAction
          notification={n}
          canAcknowledge={
            identity?.partyID != null &&
            Number(n.party_id) === Number(identity.partyID)
          }
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
      rowLink={(n) => `/notification/${n.id}/show`}
    />
  );
};

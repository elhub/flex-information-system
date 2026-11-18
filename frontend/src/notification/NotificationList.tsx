import {
  ReferenceFieldBase,
  useDataProvider,
  useGetIdentity,
  useTranslate,
} from "ra-core";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Link as RouterLink } from "react-router-dom";
import { IconDots, IconValidationCheck } from "@elhub/ds-icons";
import { ListPagination } from "../components/list/ListPagination";
import type { ListInterface } from "../components/list/types";
import {
  Alert,
  BodyText,
  Button,
  Dropdown,
  FilterPanel,
  Heading,
  Link,
  Loader,
  Panel,
  Switch,
  Tooltip,
} from "../components/ui";
import { toDateTimeString } from "../util";
import type { Notification } from "../generated-client";
import {
  EVENT_CATEGORIES,
  getNotificationTarget,
  useEventTypeLabel,
} from "../event/eventTypes";
import {
  EVENT_CATEGORY_FILTER_SOURCE,
  useNotificationList,
} from "./useNotificationList";

const useAcknowledge = () => {
  const dataProvider = useDataProvider();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (notifications: Notification[]) =>
      Promise.all(
        notifications.map((n) =>
          dataProvider.update("notification", {
            id: n.id,
            data: { acknowledged: true },
            previousData: n,
          }),
        ),
      ),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: ["notification"] }),
  });
};

const NotificationActionsMenu = ({
  notification,
}: {
  notification: Notification;
}) => {
  const translate = useTranslate();
  return (
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
        </Dropdown.Menu.GroupedList>
      </Dropdown.Menu>
    </Dropdown>
  );
};

const AcknowledgedCheck = ({
  notification,
  name,
}: {
  notification: Notification;
  name: string;
}) => {
  const translate = useTranslate();
  return (
    <Tooltip
      content={translate("text.notification.acknowledged_at_by", {
        time: toDateTimeString(notification.recorded_at),
        name,
      })}
    >
      <span className="flex shrink-0 text-semantic-text-success">
        <IconValidationCheck />
      </span>
    </Tooltip>
  );
};

const AcknowledgedInfo = ({ notification }: { notification: Notification }) => {
  if (notification.recorded_by === 0) {
    return <AcknowledgedCheck notification={notification} name="System" />;
  }

  return (
    <ReferenceFieldBase
      reference="identity"
      source="recorded_by"
      record={notification}
      loading={null}
      render={({ referenceRecord }) => {
        if (!referenceRecord) return null;
        const entityName = referenceRecord.entity_name ?? "<private>";
        const name = referenceRecord.party_name
          ? `${entityName} as ${referenceRecord.party_name}`
          : entityName;
        return <AcknowledgedCheck notification={notification} name={name} />;
      }}
    />
  );
};

const NotificationItem = ({
  notification,
  showRecipient,
  canAcknowledge,
}: {
  notification: Notification;
  showRecipient: boolean;
  canAcknowledge: boolean;
}) => {
  const translate = useTranslate();
  const eventTypeLabel = useEventTypeLabel();
  const acknowledge = useAcknowledge();
  const { event, acknowledged } = notification;
  const target = getNotificationTarget(event);
  const titleLink = target?.path ?? `/notification/${notification.id}/show`;

  const title = (
    <Link
      as={RouterLink}
      to={titleLink}
      className={`after:absolute after:inset-0 after:content-[''] ${
        acknowledged ? "font-normal" : "font-bold"
      }`}
    >
      {event ? eventTypeLabel(event.type) : "-"}
    </Link>
  );

  return (
    <li className="relative flex list-none flex-col gap-1 border-t border-semantic-border px-4 py-3 first:rounded-t-lg first:border-t-0 last:rounded-b-lg hover:bg-semantic-background-success focus-within:z-20">
      <div className="flex items-center gap-3">
        {title}
        <div className="relative z-10 ml-auto flex items-center gap-3">
          {canAcknowledge && !acknowledged && (
            <Button
              variant="tertiary"
              size="small"
              icon={acknowledge.isPending ? undefined : IconValidationCheck}
              disabled={acknowledge.isPending}
              onClick={() => acknowledge.mutate([notification])}
            >
              {acknowledge.isPending && <Loader size="small" />}
              {translate("text.notification.acknowledge")}
            </Button>
          )}
          {acknowledged && <AcknowledgedInfo notification={notification} />}
          <NotificationActionsMenu notification={notification} />
        </div>
      </div>
      <BodyText size="small" className="text-semantic-text-subtle">
        {[
          toDateTimeString(event?.time),
          showRecipient ? notification.party?.name : undefined,
        ]
          .filter(Boolean)
          .join(" · ")}
      </BodyText>
    </li>
  );
};

const NotificationItems = ({
  list,
  isFiso,
  canAcknowledge,
}: {
  list: ListInterface<Notification>;
  isFiso: boolean;
  canAcknowledge: (n: Notification) => boolean;
}) => {
  const translate = useTranslate();

  if (list.isError)
    return (
      <Alert variant="error">{translate("text.list_table.load_error")}</Alert>
    );
  if (list.isLoading) return <Loader />;
  if (list.rows.length === 0)
    return <BodyText>{translate("text.simple_table.no_results")}</BodyText>;

  return (
    <ul className="m-0 flex list-none flex-col rounded-lg border border-semantic-border p-0">
      {list.rows.map((n) => (
        <NotificationItem
          key={n.id}
          notification={n}
          showRecipient={isFiso}
          canAcknowledge={canAcknowledge(n)}
        />
      ))}
    </ul>
  );
};

export const NotificationList = () => {
  const translate = useTranslate();
  const { list } = useNotificationList();
  const { data: identity } = useGetIdentity();

  const selectedCategories = list.filters[EVENT_CATEGORY_FILTER_SOURCE]
    ? list.filters[EVENT_CATEGORY_FILTER_SOURCE].split(",")
    : [];
  const allSelected = selectedCategories.length === 0;

  const toggleCategory = (category: string) => {
    const next = selectedCategories.includes(category)
      ? selectedCategories.filter((c) => c !== category)
      : [...selectedCategories, category];
    list.setFilter(
      EVENT_CATEGORY_FILTER_SOURCE,
      next.length > 0 ? next.join(",") : undefined,
    );
  };

  const isFiso =
    identity?.role === "flex_flexibility_information_system_operator";
  const canAcknowledge = (n: Notification) =>
    identity?.partyID != null &&
    Number(n.party_id) === Number(identity.partyID);

  return (
    <div className="flex flex-col gap-2">
      <div className="mb-4 flex items-center justify-between gap-2">
        <Heading level={2} size="large">
          {translate("text.header_nav_notifications")}
        </Heading>
      </div>
      <Panel border className="flex flex-col gap-5">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <FilterPanel>
            <FilterPanel.Chip
              selected={allSelected}
              onClick={() =>
                list.setFilter(EVENT_CATEGORY_FILTER_SOURCE, undefined)
              }
            >
              {translate("text.notification.event_category.all")}
            </FilterPanel.Chip>
            {EVENT_CATEGORIES.map((category) => (
              <FilterPanel.Chip
                key={category}
                selected={selectedCategories.includes(category)}
                onClick={() => toggleCategory(category)}
              >
                {translate(`text.notification.event_category.${category}`)}
              </FilterPanel.Chip>
            ))}
          </FilterPanel>
          <Switch
            id="notification-acknowledged"
            size="small"
            position="right"
            className="ml-auto"
            checked={list.filters.acknowledged === "true"}
            onChange={(e) =>
              list.setFilter(
                "acknowledged",
                e.target.checked ? "true" : "false",
              )
            }
          >
            {translate("text.notification.show_acknowledged")}
          </Switch>
        </div>
        <NotificationItems
          list={list}
          isFiso={isFiso}
          canAcknowledge={canAcknowledge}
        />
        <ListPagination list={list} />
      </Panel>
    </div>
  );
};

import { useQuery } from "@tanstack/react-query";
import { IconWarningCircle } from "@elhub/ds-icons";
import { useGetIdentity, useTranslate } from "ra-core";
import type { ListFilters } from "../../components/list/types";
import {
  EVENT_CATEGORY_FILTER_SOURCE,
  fetchNotifications,
  notificationQueryKey,
} from "../../notification/useNotificationList";
import { StatCard } from "./StatCard";

export const UnhandledCommentsPanel = () => {
  const translate = useTranslate();
  const { data: identity, isPending: isIdentityPending } = useGetIdentity();

  // Deliberately independent of the default filters of the notification list
  // page, which may change.
  const isFiso =
    identity?.role === "flex_flexibility_information_system_operator";
  const filters: ListFilters = {
    acknowledged: "false",
    [EVENT_CATEGORY_FILTER_SOURCE]: "comment",
    ...(identity?.partyID && !isFiso
      ? { party_id: String(identity.partyID) }
      : {}),
  };

  // only the count is needed, so fetch a single row
  const params = {
    filters,
    sort: { field: "id", order: "desc" as const },
    page: 1,
    perPage: 1,
  };
  const { data } = useQuery({
    queryKey: notificationQueryKey(params),
    queryFn: () => fetchNotifications(params),
    enabled: !isIdentityPending,
  });

  const listSearch = new URLSearchParams({ filtered: "1" });
  Object.entries(filters).forEach(([k, v]) => listSearch.set(`f.${k}`, v));

  return (
    <StatCard
      label={translate("text.dashboard.unacknowledged_comments")}
      value={data?.count ?? 0}
      icon={
        <IconWarningCircle size="medium" className="text-semantic-text-error" />
      }
      borderClass="border-l-semantic-border-error"
      iconBgClass="bg-semantic-background-error"
      linkTo={`/notification?${listSearch.toString()}`}
    />
  );
};

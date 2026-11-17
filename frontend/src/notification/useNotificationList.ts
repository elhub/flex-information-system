import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { useGetIdentity } from "ra-core";
import { listNotification } from "../generated-client";
import type { Notification } from "../generated-client";
import { getCountAndData } from "../util";
import eventTypes from "../event/eventTypes";
import { buildListQuery } from "../components/list/postgrest";
import { useListState } from "../components/list/useListState";
import type {
  ListFilters,
  ListInterface,
  ListSort,
} from "../components/list/types";

// Filter on a category of event types. It is translated to an exact match on
// event.type in the query, since event.type is an ltree and does not support ilike.
export const EVENT_CATEGORY_FILTER_SOURCE = "event_category@in";
const EVENT_TYPE_QUERY_SOURCE = "event.type@in";

export const eventTypeIdsForCategories = (categories: string[]) =>
  eventTypes
    .filter((et) => et.category && categories.includes(et.category))
    .map((et) => et.id);

export const toQueryFilters = (filters: ListFilters): ListFilters => {
  const { [EVENT_CATEGORY_FILTER_SOURCE]: categories, ...rest } = filters;
  if (!categories) return rest;
  const types = eventTypeIdsForCategories(categories.split(","));
  return { ...rest, [EVENT_TYPE_QUERY_SOURCE]: types.join(",") };
};

type Query = NonNullable<Parameters<typeof listNotification>[0]>["query"];

type NotificationQueryParams = {
  filters: ListFilters;
  sort: ListSort;
  page: number;
  perPage: number;
};

export const notificationQueryKey = (params: NotificationQueryParams) =>
  ["notification", "list", params] as const;

export const fetchNotifications = ({
  filters,
  sort,
  page,
  perPage,
}: NotificationQueryParams) =>
  listNotification({
    query: {
      ...buildListQuery({
        filters: toQueryFilters(filters),
        sort,
        page,
        perPage,
      }),
      // inner-join the event so the event type filter drops other rows
      embed: "event!,party",
    } as Query,
    headers: { Prefer: "count=exact" },
  }).then(getCountAndData);

export const useNotificationList = () => {
  const { data: identity, isPending: isIdentityPending } = useGetIdentity();

  // FISO can see the notifications of all parties, so it is not narrowed down
  // to its own party by default.
  const isFiso =
    identity?.role === "flex_flexibility_information_system_operator";

  const defaultFilters: ListFilters = {
    acknowledged: "false",
    [EVENT_CATEGORY_FILTER_SOURCE]: "comment",
    ...(identity?.partyID && !isFiso
      ? { party_id: String(identity.partyID) }
      : {}),
  };

  const state = useListState({
    defaultFilters,
    defaultSort: { field: "id", order: "desc" },
  });
  const { filters, sort, page, perPage } = state;

  const query = useQuery({
    queryKey: notificationQueryKey({ filters, sort, page, perPage }),
    queryFn: () => fetchNotifications({ filters, sort, page, perPage }),
    placeholderData: keepPreviousData,
    enabled: !isIdentityPending,
  });

  const list: ListInterface<Notification> = {
    ...state,
    rows: query.data?.data ?? [],
    total: query.data?.count ?? 0,
    isLoading: isIdentityPending || query.isLoading,
    isError: query.isError,
  };

  return { list };
};

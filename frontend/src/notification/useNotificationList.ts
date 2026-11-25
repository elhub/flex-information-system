import { useQuery } from "@tanstack/react-query";
import { useGetIdentity } from "ra-core";
import { listNotification } from "../generated-client";
import type { Notification } from "../generated-client";
import { throwOnError } from "../util";
import eventTypes from "../event/eventTypes";
import { buildListQuery } from "../components/list/postgrest";
import { useListState } from "../components/list/useListState";
import type {
  ListFilters,
  ListInterface,
  ListSort,
} from "../components/list/types";

export const EVENT_CATEGORY_FILTER_SOURCE = "event_category@in";

export const eventTypeIdsForCategories = (categories: string[]) =>
  eventTypes
    .filter((et) => et.category && categories.includes(et.category))
    .map((et) => et.id);

// The category is not a column on notification, so it is removed from the
// filters and applied on the embedded event instead (see categoryQuery).
export const toQueryFilters = (filters: ListFilters): ListFilters =>
  Object.fromEntries(
    Object.entries(filters).filter(
      ([source]) => source !== EVENT_CATEGORY_FILTER_SOURCE,
    ),
  );

export const categoriesFromFilters = (filters: ListFilters): string[] =>
  filters[EVENT_CATEGORY_FILTER_SOURCE]
    ? filters[EVENT_CATEGORY_FILTER_SOURCE].split(",")
    : [];

// Inner-join the event and filter it on the types of the selected categories,
// so notifications of other events are dropped by the backend.
export const categoryQuery = (
  filters: ListFilters,
): { embed: string; filter: Record<string, string> } => {
  const categories = categoriesFromFilters(filters);
  if (categories.length === 0) return { embed: "event", filter: {} };
  return {
    embed: "event!",
    filter: {
      "event.type": `in.(${eventTypeIdsForCategories(categories).join(",")})`,
    },
  };
};

export const scopeFilters = (
  filters: ListFilters,
  partyId?: number | string,
): ListFilters => {
  const rest = Object.fromEntries(
    Object.entries(filters).filter(([source]) => source !== "party_id"),
  );
  return partyId !== undefined ? { ...rest, party_id: String(partyId) } : rest;
};

export type Query = NonNullable<
  Parameters<typeof listNotification>[0]
>["query"];

export type NotificationQueryParams = {
  partyId?: number | string;
  filters: ListFilters;
  sort: ListSort;
  page: number;
  perPage: number;
};

export type NotificationPage = {
  data: Notification[];
  hasNextPage: boolean;
};

export const notificationQueryKey = (params: NotificationQueryParams) =>
  ["notification", "list", params.partyId, params] as const;

export const fetchNotifications = async ({
  partyId,
  filters,
  sort,
  page,
  perPage,
}: NotificationQueryParams): Promise<NotificationPage> => {
  const { embed, filter } = categoryQuery(filters);
  const base = buildListQuery({
    filters: scopeFilters(toQueryFilters(filters), partyId),
    sort,
    page,
    perPage,
  });

  // Counting is expensive (every event is checked by RLS), so no total is
  // requested. One extra row tells whether there is a next page.
  const rows = await listNotification({
    query: {
      ...base,
      ...filter,
      limit: String(perPage + 1),
      embed,
    } as Query,
  }).then(throwOnError);

  return { data: rows.slice(0, perPage), hasNextPage: rows.length > perPage };
};

export const useNotificationList = () => {
  const { data: identity, isPending: isIdentityPending } = useGetIdentity();

  const partyId = identity?.partyID;

  const defaultFilters: ListFilters = {
    acknowledged: "false",
    [EVENT_CATEGORY_FILTER_SOURCE]: "comment",
  };

  const state = useListState({
    defaultFilters,
    defaultSort: { field: "id", order: "desc" },
  });
  const { filters, sort, page, perPage } = state;

  const query = useQuery({
    queryKey: notificationQueryKey({ partyId, filters, sort, page, perPage }),
    queryFn: () =>
      fetchNotifications({ partyId, filters, sort, page, perPage }),
    // Never show rows from another party while loading.
    placeholderData: (previous, previousQuery) =>
      previousQuery && previousQuery.queryKey[2] === partyId
        ? previous
        : undefined,
    enabled: !isIdentityPending && partyId !== undefined,
  });

  const list: ListInterface<Notification> = {
    ...state,
    rows: query.data?.data ?? [],
    hasNextPage: query.data?.hasNextPage ?? false,
    isLoading: isIdentityPending || query.isLoading,
    isError: query.isError,
  };

  return { list };
};

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

// The party is derived from the identity, never from the (URL) filters.
// FISO sees all parties and has no party constraint.
export const scopeFilters = (
  filters: ListFilters,
  scope: NotificationScope,
): ListFilters => {
  const rest = Object.fromEntries(
    Object.entries(filters).filter(([source]) => source !== "party_id"),
  );
  return scope.partyId !== undefined &&
    scope.role !== "flex_flexibility_information_system_operator"
    ? { ...rest, party_id: String(scope.partyId) }
    : rest;
};

export type Query = NonNullable<
  Parameters<typeof listNotification>[0]
>["query"];

// Identity the query runs as, used to scope cached results.
export type NotificationScope = {
  identityId?: string | number;
  role?: string;
  partyId?: number | string;
};

export type NotificationQueryParams = {
  scope: NotificationScope;
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
  ["notification", "list", params.scope, params] as const;

export const fetchNotifications = async ({
  scope,
  filters,
  sort,
  page,
  perPage,
}: NotificationQueryParams): Promise<NotificationPage> => {
  const { embed, filter } = categoryQuery(filters);
  const base = buildListQuery({
    filters: scopeFilters(toQueryFilters(filters), scope),
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
      embed: `party,${embed}`,
    } as Query,
  }).then(throwOnError);

  return { data: rows.slice(0, perPage), hasNextPage: rows.length > perPage };
};

export const useNotificationList = () => {
  const { data: identity, isPending: isIdentityPending } = useGetIdentity();

  const scope: NotificationScope = {
    identityId: identity?.id,
    role: identity?.role,
    partyId: identity?.partyID,
  };

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
    queryKey: notificationQueryKey({ scope, filters, sort, page, perPage }),
    queryFn: () => fetchNotifications({ scope, filters, sort, page, perPage }),
    // Never show rows from another identity while loading.
    placeholderData: (previous, previousQuery) =>
      previousQuery &&
      JSON.stringify(previousQuery.queryKey[2]) === JSON.stringify(scope)
        ? previous
        : undefined,
    enabled: !isIdentityPending,
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

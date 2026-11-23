import { useQuery } from "@tanstack/react-query";
import { useGetIdentity } from "ra-core";
import { listEvent, listNotification } from "../generated-client";
import type { Event, Notification } from "../generated-client";
import { getCountAndData, throwOnError } from "../util";
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
// filters sent to the notification query and applied on the frontend instead.
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

const EVENT_SELECT = "id,type,source,subject,time";
const EVENT_ID_CHUNK_SIZE = 200;

const chunk = <T>(items: T[], size: number): T[][] =>
  Array.from({ length: Math.ceil(items.length / size) }, (_, i) =>
    items.slice(i * size, (i + 1) * size),
  );

// Fetch the events of the given ids separately from the notifications, since
// embedding them in the notification query is slow.
// The type filter is always combined with the id filter, so the ltree
// comparison only runs on the rows selected by id.
const fetchEventChunk = (
  idChunk: number[],
  { select = EVENT_SELECT, types, limit }: FetchEventsOptions,
) =>
  listEvent({
    query: {
      id: `in.(${idChunk.join(",")})`,
      select,
      ...(types ? { type: `in.(${types.join(",")})` } : {}),
      ...(limit ? { limit: String(limit) } : {}),
    } as NonNullable<Parameters<typeof listEvent>[0]>["query"],
  }).then(throwOnError);

type FetchEventsOptions = {
  select?: string;
  // only return events of these types
  types?: string[];
  limit?: number;
};

export const fetchEventsByIds = async (
  ids: number[],
  options: FetchEventsOptions = {},
): Promise<Event[]> => {
  const unique = [...new Set(ids)];
  const responses = await Promise.all(
    chunk(unique, EVENT_ID_CHUNK_SIZE).map((idChunk) =>
      fetchEventChunk(idChunk, options),
    ),
  );
  return responses.flat();
};

// Resolves true as soon as one chunk of ids contains an event of the types.
export const hasEventOfTypes = async (
  ids: number[],
  types: string[],
): Promise<boolean> => {
  if (types.length === 0) return false;
  for (const idChunk of chunk([...new Set(ids)], EVENT_ID_CHUNK_SIZE)) {
    const events = await fetchEventChunk(idChunk, {
      select: "id",
      types,
      limit: 1,
    });
    if (events.length > 0) return true;
  }
  return false;
};

export const eventMatchesCategories = (
  event: Pick<Event, "type"> | undefined | null,
  categories: string[],
) => !!event && eventTypeIdsForCategories(categories).includes(event.type);

export type NotificationPage = {
  count: number;
  data: Notification[];
  // true when the whole result set was fetched and must be paged on the frontend
  clientPaged: boolean;
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
  const categories = categoriesFromFilters(filters);
  const filterOnCategory = categories.length > 0;

  const base = buildListQuery({
    filters: scopeFilters(toQueryFilters(filters), scope),
    sort,
    page,
    perPage,
  });
  if (filterOnCategory) {
    // The category is filtered on the frontend, so fetch all matching rows.
    delete base.limit;
    delete base.offset;
  }

  const { count, data: notifications } = await listNotification({
    query: { ...base, embed: "party" } as Query,
    headers: { Prefer: "count=exact" },
  }).then(getCountAndData);

  const events = await fetchEventsByIds(
    notifications.map((n) => n.event_id),
    filterOnCategory ? { types: eventTypeIdsForCategories(categories) } : {},
  );
  const eventById = new Map(events.map((e) => [e.id, e]));
  const withEvents = notifications.map((n) => ({
    ...n,
    event: eventById.get(n.event_id) ?? null,
  }));

  if (!filterOnCategory) {
    return { count, data: withEvents, clientPaged: false };
  }
  const filtered = withEvents.filter((n) =>
    eventMatchesCategories(n.event, categories),
  );
  return { count: filtered.length, data: filtered, clientPaged: true };
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

  // With a category filter everything is fetched once and paged on the
  // frontend, so the page should not be part of the query key.
  const clientPaged = categoriesFromFilters(filters).length > 0;

  const query = useQuery({
    queryKey: notificationQueryKey({
      scope,
      filters,
      sort,
      page: clientPaged ? 0 : page,
      perPage: clientPaged ? 0 : perPage,
    }),
    queryFn: () => fetchNotifications({ scope, filters, sort, page, perPage }),
    // Never show rows from another identity while loading.
    placeholderData: (previous, previousQuery) =>
      previousQuery &&
      JSON.stringify(previousQuery.queryKey[2]) === JSON.stringify(scope)
        ? previous
        : undefined,
    enabled: !isIdentityPending,
  });

  const rows = query.data?.clientPaged
    ? query.data.data.slice((page - 1) * perPage, page * perPage)
    : (query.data?.data ?? []);

  const list: ListInterface<Notification> = {
    ...state,
    rows,
    total: query.data?.count ?? 0,
    isLoading: isIdentityPending || query.isLoading,
    isError: query.isError,
  };

  return { list };
};

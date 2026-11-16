import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { useGetIdentity } from "ra-core";
import { listNotification } from "../generated-client";
import type { Notification } from "../generated-client";
import { getCountAndData } from "../util";
import { buildListQuery } from "../components/list/postgrest";
import { useListState } from "../components/list/useListState";
import type { ListFilters, ListInterface } from "../components/list/types";

// Filter on a category of event types. It is translated to an exact match on
// event.type in the query, since event.type is an ltree and does not support ilike.
export const EVENT_CATEGORY_FILTER_SOURCE = "event_category@in";
const EVENT_TYPE_QUERY_SOURCE = "event.type@in";

const COMMENT_RESOURCES = [
  "controllable_unit_suspension_comment",
  "service_provider_product_application_comment",
  "service_provider_product_suspension_comment",
  "service_providing_group_grid_prequalification_comment",
  "service_providing_group_grid_suspension_comment",
  "service_providing_group_product_application_comment",
  "service_providing_group_product_suspension_comment",
];

export const EVENT_CATEGORIES: Record<string, string[]> = {
  comment: COMMENT_RESOURCES.flatMap((resource) =>
    ["create", "update"].map((op) => `no.elhub.flex.${resource}.${op}`),
  ),
};

export const toQueryFilters = (filters: ListFilters): ListFilters => {
  const { [EVENT_CATEGORY_FILTER_SOURCE]: categories, ...rest } = filters;
  if (!categories) return rest;
  const types = categories
    .split(",")
    .flatMap((category) => EVENT_CATEGORIES[category] ?? []);
  return { ...rest, [EVENT_TYPE_QUERY_SOURCE]: types.join(",") };
};

type Query = NonNullable<Parameters<typeof listNotification>[0]>["query"];

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
    queryKey: ["notification", "list", { filters, sort, page, perPage }],
    queryFn: () =>
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
      }).then(getCountAndData),
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

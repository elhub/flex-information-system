import { useQuery } from "@tanstack/react-query";
import { useGetIdentity } from "ra-core";
import type { ListFilters } from "../components/list/types";
import {
  categoriesFromFilters,
  EVENT_CATEGORY_FILTER_SOURCE,
  eventTypeIdsForCategories,
  hasEventOfTypes,
  NotificationQueryParams,
  Query,
  toQueryFilters,
} from "./useNotificationList";
import { listNotification } from "../generated-client";
import { buildListQuery } from "../components/list/postgrest";
import { throwOnError } from "../util";

const fetchHasNotification = async ({
  filters,
}: Pick<NotificationQueryParams, "filters">) => {
  const notifications = await listNotification({
    query: {
      ...buildListQuery({
        filters: toQueryFilters(filters),
        sort: { field: "id", order: "desc" },
        page: 1,
        perPage: 3000,
      }),
      select: "event_id",
    } as Query,
  }).then(throwOnError);

  if (notifications.length === 0) return false;
  const categories = categoriesFromFilters(filters);
  const ids = notifications.map((n) => n.event_id);
  return hasEventOfTypes(ids, eventTypeIdsForCategories(categories));
};

export const useUnacknowledgedComments = ({
  enabled = true,
}: { enabled?: boolean } = {}) => {
  const { data: identity, isPending: isIdentityPending } = useGetIdentity();

  const isFiso =
    identity?.role === "flex_flexibility_information_system_operator";
  const partyID = identity?.partyID;

  const { data } = useQuery({
    queryKey: ["notification", "unacknowledged-comments", partyID],
    queryFn: () => {
      const filters: ListFilters = {
        acknowledged: "false",
        [EVENT_CATEGORY_FILTER_SOURCE]: "comment",
        party_id: String(partyID),
      };
      return fetchHasNotification({ filters });
    },
    staleTime: 60_000,
    enabled: enabled && !isIdentityPending && !!partyID && !isFiso,
  });

  return { hasUnacknowledged: !isFiso && (data ?? false) };
};

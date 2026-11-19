import { useQuery } from "@tanstack/react-query";
import { useGetIdentity } from "ra-core";
import type { ListFilters } from "../components/list/types";
import {
  EVENT_CATEGORY_FILTER_SOURCE,
  NotificationQueryParams,
  Query,
  toQueryFilters,
} from "./useNotificationList";
import { listNotification } from "../generated-client";
import { buildListQuery } from "../components/list/postgrest";
import { throwOnError } from "../util";

// Cheap existence check: no count, no party embed and a single row, so that
// the database can stop at the first match.
export const fetchHasNotification = ({
  filters,
}: Pick<NotificationQueryParams, "filters">) =>
  listNotification({
    query: {
      ...buildListQuery({
        filters: toQueryFilters(filters),
        sort: { field: "id", order: "desc" },
        page: 1,
        perPage: 1,
      }),
      embed: "event!",
    } as Query,
  })
    .then(throwOnError)
    .then((data) => data.length > 0);

export const useUnacknowledgedComments = ({
  enabled = true,
}: { enabled?: boolean } = {}) => {
  const { data: identity, isPending: isIdentityPending } = useGetIdentity();

  const isFiso =
    identity?.role === "flex_flexibility_information_system_operator";
  const filters: ListFilters = {
    acknowledged: "false",
    [EVENT_CATEGORY_FILTER_SOURCE]: "comment",
    ...(identity?.partyID && !isFiso
      ? { party_id: String(identity.partyID) }
      : {}),
  };

  const { data } = useQuery({
    queryKey: ["notification", "unacknowledged-comments", filters],
    queryFn: () => fetchHasNotification({ filters }),
    enabled: enabled && !isIdentityPending && !!identity?.partyID,
  });

  return { hasUnacknowledged: data ?? false };
};

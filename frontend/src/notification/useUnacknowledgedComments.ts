import { useQuery } from "@tanstack/react-query";
import { useGetIdentity } from "ra-core";
import type { ListFilters } from "../components/list/types";
import {
  EVENT_CATEGORY_FILTER_SOURCE,
  fetchNotifications,
  notificationQueryKey,
} from "./useNotificationList";

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
    enabled: enabled && !isIdentityPending && !!identity?.partyID,
  });

  return { count: data?.count ?? 0 };
};

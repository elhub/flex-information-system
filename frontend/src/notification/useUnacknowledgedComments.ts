import { useCallback, useSyncExternalStore } from "react";
import { useQuery } from "@tanstack/react-query";
import { useGetIdentity } from "ra-core";
import type { ListFilters } from "../components/list/types";
import {
  categoryQuery,
  EVENT_CATEGORY_FILTER_SOURCE,
  Query,
  toQueryFilters,
} from "./useNotificationList";
import { listNotification } from "../generated-client";
import { buildListQuery } from "../components/list/postgrest";
import { throwOnError } from "../util";
import { bellStorageKey, getLastChecked, setLastChecked } from "./lastChecked";

const CHECKED_EVENT = "notification-bell-checked";

// Recording time of the latest unacknowledged notification matching the
// filters, or null if there is none.
const fetchLatestRecordedAt = async (filters: ListFilters) => {
  const { embed, filter } = categoryQuery(filters);
  const notifications = await listNotification({
    query: {
      ...buildListQuery({
        filters: toQueryFilters(filters),
        sort: { field: "recorded_at", order: "desc" },
        page: 1,
        perPage: 1,
      }),
      ...filter,
      embed,
    } as Query,
  }).then(throwOnError);
  return notifications[0]?.recorded_at ?? null;
};

// Time the user last clicked the bell, stored per user and party.
const useLastChecked = (storageKey: string | undefined) => {
  const lastChecked = useSyncExternalStore(
    (callback) => {
      window.addEventListener("storage", callback);
      window.addEventListener(CHECKED_EVENT, callback);
      return () => {
        window.removeEventListener("storage", callback);
        window.removeEventListener(CHECKED_EVENT, callback);
      };
    },
    () => (storageKey ? getLastChecked(storageKey) : null),
  );

  const markChecked = useCallback(() => {
    if (!storageKey) return;
    setLastChecked(storageKey, new Date());
    window.dispatchEvent(new Event(CHECKED_EVENT));
  }, [storageKey]);

  return { lastChecked, markChecked };
};

export const useUnacknowledgedComments = ({
  enabled = true,
}: { enabled?: boolean } = {}) => {
  const { data: identity, isPending: isIdentityPending } = useGetIdentity();

  const isFiso =
    identity?.role === "flex_flexibility_information_system_operator";
  const partyID = identity?.partyID;

  const { data: storageKey } = useQuery({
    queryKey: ["notification", "bell-storage-key", identity?.id, partyID],
    queryFn: () => bellStorageKey(String(identity?.id), partyID!),
    staleTime: Infinity,
    enabled: !!identity && partyID !== undefined,
  });
  const { lastChecked, markChecked } = useLastChecked(storageKey);

  const { data: latestRecordedAt } = useQuery({
    queryKey: [
      "notification",
      "unacknowledged-comments",
      identity?.id,
      identity?.role,
      partyID,
    ],
    queryFn: () => {
      const filters: ListFilters = {
        acknowledged: "false",
        [EVENT_CATEGORY_FILTER_SOURCE]: "comment",
        party_id: String(partyID),
      };
      return fetchLatestRecordedAt(filters);
    },
    enabled: enabled && !isIdentityPending && !!partyID && !isFiso,
  });

  const hasNew =
    !!latestRecordedAt &&
    (!lastChecked || new Date(latestRecordedAt) > new Date(lastChecked));

  return { hasUnacknowledged: !isFiso && hasNew, markChecked };
};

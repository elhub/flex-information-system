import { useCallback, useSyncExternalStore } from "react";
import { useQuery } from "@tanstack/react-query";
import { useGetIdentity } from "ra-core";
import type { ListFilters } from "../components/list/types";
import {
  categoriesFromFilters,
  EVENT_CATEGORY_FILTER_SOURCE,
  eventTypeIdsForCategories,
  hasEventOfTypes,
  Query,
  toQueryFilters,
} from "./useNotificationList";
import { listNotification } from "../generated-client";
import { buildListQuery } from "../components/list/postgrest";
import { throwOnError } from "../util";
import { bellStorageKey, getLastChecked, setLastChecked } from "./lastChecked";

const CHECKED_EVENT = "notification-bell-checked";

// Fetch the unacknowledged notifications matching the filters (id and time only).
const fetchNotificationRefs = (filters: ListFilters) =>
  listNotification({
    query: {
      ...buildListQuery({
        filters: toQueryFilters(filters),
        sort: { field: "id", order: "desc" },
        page: 1,
        perPage: 3000,
      }),
      select: "event_id,recorded_at",
    } as Query,
  }).then(throwOnError);

// Keep only notifications recorded after the given time (all if null).
const recordedAfter = <T extends { recorded_at: string }>(
  notifications: T[],
  sinceLastChecked: string | null,
) => {
  if (sinceLastChecked === null) return notifications;
  const sinceTime = Date.parse(sinceLastChecked);
  return notifications.filter((n) => Date.parse(n.recorded_at) > sinceTime);
};

// Whether any of the events belongs to the categories in the filters.
const hasEventInCategories = (eventIds: number[], filters: ListFilters) =>
  eventIds.length > 0 &&
  hasEventOfTypes(
    eventIds,
    eventTypeIdsForCategories(categoriesFromFilters(filters)),
  );

const fetchHasNewComments = async (
  filters: ListFilters,
  lastChecked: string | null,
) => {
  const notifications = await fetchNotificationRefs(filters);
  const recent = recordedAfter(notifications, lastChecked);
  return hasEventInCategories(
    recent.map((n) => n.event_id),
    filters,
  );
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

  const { data } = useQuery({
    queryKey: ["notification", "unacknowledged-comments", partyID, lastChecked],
    queryFn: () => {
      const filters: ListFilters = {
        acknowledged: "false",
        [EVENT_CATEGORY_FILTER_SOURCE]: "comment",
        party_id: String(partyID),
      };
      return fetchHasNewComments(filters, lastChecked);
    },
    staleTime: 60_000,
    enabled: enabled && !isIdentityPending && !!partyID && !isFiso,
  });

  return { hasUnacknowledged: !isFiso && (data ?? false), markChecked };
};

import { useQuery } from "@tanstack/react-query";
import {
  listServiceProvidingGroupMembership,
  listServiceProvidingGroupMembershipHistory,
  ListServiceProvidingGroupMembershipHistoryData,
} from "../../generated-client";
import { throwOnError } from "../../util";

type WithNestedFilter<Query> = Query & Record<string, string>;

const SPG_MEMBERSHIP_EMBED = "service_providing_group";

const fetchSpgMembershipsForControllableUnit = (controllableUnitId: number) =>
  listServiceProvidingGroupMembership({
    query: {
      controllable_unit_id: "eq." + controllableUnitId,
      embed: SPG_MEMBERSHIP_EMBED,
      order: "valid_from.desc",
    },
  }).then(throwOnError);

export const cuSpgMembershipsQueryKey = (controllableUnitId: number) => [
  "controllableUnitSpgMemberships",
  controllableUnitId,
];

export const useControllableUnitSpgMemberships = (
  controllableUnitId: number,
  options?: { enabled?: boolean },
) =>
  useQuery({
    queryKey: cuSpgMembershipsQueryKey(controllableUnitId),
    queryFn: () => fetchSpgMembershipsForControllableUnit(controllableUnitId),
    enabled: !!controllableUnitId && (options?.enabled ?? true),
  });

const fetchSpgMembershipHistoryForControllableUnit = async (
  controllableUnitId: number,
) => {
  const query: WithNestedFilter<
    ListServiceProvidingGroupMembershipHistoryData["query"]
  > = {
    controllable_unit_id: "eq." + controllableUnitId,
    order: "service_providing_group_membership_id.asc,recorded_at.desc",
    embed: "service_providing_group_history!",
    "service_providing_group_history.as_of": new Date().toISOString(),
  };

  const history = await listServiceProvidingGroupMembershipHistory({
    query,
  }).then(throwOnError);

  if (history.length === 0) {
    return [];
  }

  return history.map((h) => ({
    ...h,
    service_providing_group: h.service_providing_group_history?.[0] ?? null,
  }));
};

export const cuSpgMembershipHistoryQueryKey = (controllableUnitId: number) => [
  "controllableUnitSpgMembershipHistory",
  controllableUnitId,
];

export const useControllableUnitSpgMembershipHistory = (
  controllableUnitId: number,
  options?: { enabled?: boolean },
) =>
  useQuery({
    queryKey: cuSpgMembershipHistoryQueryKey(controllableUnitId),
    queryFn: () =>
      fetchSpgMembershipHistoryForControllableUnit(controllableUnitId),
    enabled: !!controllableUnitId && (options?.enabled ?? true),
  });

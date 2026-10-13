import { useQuery } from "@tanstack/react-query";
import {
  listServiceProvidingGroupMembershipHistory,
  ListServiceProvidingGroupMembershipHistoryData,
  ServiceProvidingGroupMembershipHistory,
  ControllableUnitHistory,
  listControllableUnitHistory,
  listIdentity,
  Identity,
} from "../../../generated-client";
import { throwOnError } from "../../../util";

export type SpgChangeStatus = "added" | "removed" | "changed" | "unchanged";

export type SpgChangeRow = {
  id: number;
  status: SpgChangeStatus;
  old: ServiceProvidingGroupMembershipHistory | undefined;
  new: ServiceProvidingGroupMembershipHistory | undefined;
  firstChange: string | undefined;
  lastChange: string | undefined;
};

type WithNestedFilter<Query> = Query & Record<string, string>;

const minDate = (...values: (string | undefined)[]): string | undefined =>
  values
    .filter((value): value is string => !!value)
    .reduce<string | undefined>(
      (min, value) => (!min || value < min ? value : min),
      undefined,
    );

const maxDate = (...values: (string | undefined)[]): string | undefined =>
  values
    .filter((value): value is string => !!value)
    .reduce<string | undefined>(
      (max, value) => (!max || value > max ? value : max),
      undefined,
    );

export const useIdentityMap = (ids: number[]): Record<number, Identity> => {
  const uniqueIds = Array.from(new Set(ids));
  const { data } = useQuery({
    queryKey: ["identities", uniqueIds],
    queryFn: () =>
      listIdentity({ query: { id: `in.(${uniqueIds.join(",")})` } }).then(
        throwOnError,
      ),
    enabled: ids.length > 0,
  });

  return {
    ...Object.fromEntries((data ?? []).map((i) => [i.id, i])),
    0: { id: 0, entity_id: 0, entity_name: "System", party_name: "System" },
  };
};

export const fetchControllableUnitHistory = async (
  controllableUnitId: number,
): Promise<ControllableUnitHistory[]> => {
  return await listControllableUnitHistory({
    query: {
      controllable_unit_id: "eq." + controllableUnitId,
    },
  }).then(throwOnError);
};

export const fetchSnapshot = async (
  spgId: number,
  asOf: string,
): Promise<Map<number, ServiceProvidingGroupMembershipHistory>> => {
  const query: WithNestedFilter<
    ListServiceProvidingGroupMembershipHistoryData["query"]
  > = {
    service_providing_group_id: `eq.${spgId}`,
    as_of: asOf,
    valid_at: asOf,
    embed: "controllable_unit_history!",
    "controllable_unit_history.as_of": asOf,
  };

  const memberships = await listServiceProvidingGroupMembershipHistory({
    query,
  }).then(throwOnError);

  const snapshot = new Map<number, ServiceProvidingGroupMembershipHistory>();
  for (const membership of memberships) {
    if (!membership.controllable_unit_history?.[0]) continue;
    snapshot.set(membership.controllable_unit_id, membership);
  }
  return snapshot;
};

export const CU_COMPARED_PROPERTIES: (keyof ControllableUnitHistory)[] = [
  "name",
  "status",
  "maximum_active_power",
  "regulation_direction",
];

type Membership = ServiceProvidingGroupMembershipHistory | undefined;

/** CU properties whose values differ between the two snapshots. */
export const changedCuProperties = (
  oldMembership: Membership,
  newMembership: Membership,
): (keyof ControllableUnitHistory)[] => {
  const oldCu = oldMembership?.controllable_unit_history?.[0];
  const newCu = newMembership?.controllable_unit_history?.[0];
  if (!oldCu || !newCu) return [];
  return CU_COMPARED_PROPERTIES.filter((prop) => oldCu[prop] !== newCu[prop]);
};

/** True if the membership's valid_from/valid_to differ between snapshots. */
export const membershipValidityChanged = (
  oldMembership: Membership,
  newMembership: Membership,
): boolean =>
  (oldMembership?.valid_from ?? null) !== (newMembership?.valid_from ?? null) ||
  (oldMembership?.valid_to ?? null) !== (newMembership?.valid_to ?? null);

export const fetchSpgChanges = async (
  spgId: number,
  from: string,
  to: string,
): Promise<SpgChangeRow[]> => {
  const [oldSnapshot, currentSnapshot] = await Promise.all([
    fetchSnapshot(spgId, from),
    fetchSnapshot(spgId, to),
  ]);

  const allIds = new Set([...oldSnapshot.keys(), ...currentSnapshot.keys()]);

  const rows: SpgChangeRow[] = Array.from(allIds).map((id) => {
    const oldMembership = oldSnapshot.get(id);
    const newMembership = currentSnapshot.get(id);
    const oldCu = oldMembership?.controllable_unit_history?.[0];
    const newCu = newMembership?.controllable_unit_history?.[0];

    const hasChanges =
      changedCuProperties(oldMembership, newMembership).length > 0 ||
      membershipValidityChanged(oldMembership, newMembership);

    let status: SpgChangeStatus;
    if (!oldMembership && newMembership) {
      status = "added";
    } else if (oldMembership && !newMembership) {
      status = "removed";
    } else if (hasChanges) {
      status = "changed";
    } else {
      status = "unchanged";
    }

    return {
      id,
      status,
      old: oldMembership,
      new: newMembership,
      firstChange: minDate(
        oldMembership?.replaced_at,
        oldCu?.replaced_at,
        newMembership?.recorded_at,
        newCu?.recorded_at,
      ),
      lastChange: maxDate(
        oldMembership?.replaced_at,
        oldCu?.replaced_at,
        newMembership?.recorded_at,
        newCu?.recorded_at,
      ),
    };
  });

  rows.sort((a, b) => {
    const aName =
      a.new?.controllable_unit_history?.[0]?.name ??
      a.old?.controllable_unit_history?.[0]?.name ??
      "";
    const bName =
      b.new?.controllable_unit_history?.[0]?.name ??
      b.old?.controllable_unit_history?.[0]?.name ??
      "";
    return aName.localeCompare(bName);
  });

  return rows;
};

export const spgChangesQueryKey = (
  spgId: number | undefined,
  from: string | undefined,
  to: string | undefined,
) => ["serviceProvidingGroupChanges", spgId, from, to];

export const useSpgChangesViewModel = (
  spgId: number | undefined,
  from: string | undefined,
  to: string | undefined,
) => {
  return useQuery({
    queryKey: spgChangesQueryKey(spgId, from, to),
    queryFn: () => fetchSpgChanges(spgId ?? 0, from ?? "", to ?? ""),
    enabled: !!spgId && !!from && !!to,
  });
};

export const controllableUnitHistoryQueryKey = (controllableUnitId: number) => [
  "controllableUnitHistory",
  controllableUnitId,
];

export type ControllableUnitHistoryWithNames = ControllableUnitHistory & {
  recorded_by_name: string | undefined;
  replaced_by_name: string | undefined;
};

export const useControllableUnitHistory = (controllableUnitId: number) => {
  const historyResult = useQuery({
    queryKey: controllableUnitHistoryQueryKey(controllableUnitId),
    queryFn: () => fetchControllableUnitHistory(controllableUnitId),
  });

  const history = historyResult.data ?? [];

  const identityMap = useIdentityMap(
    history
      .flatMap((h) => [h.replaced_by, h.recorded_by])
      .filter((id): id is number => id !== undefined && id !== null),
  );
  const historyWithName = history.map((h) => ({
    ...h,
    recorded_by_name: h.recorded_by
      ? identityMap[h.recorded_by]?.party_name
      : undefined,
    replaced_by_name: h.replaced_by
      ? identityMap[h.replaced_by]?.party_name
      : undefined,
  }));

  return {
    data: historyWithName,
    isLoading: historyResult.isLoading,
    error: historyResult.error,
  };
};

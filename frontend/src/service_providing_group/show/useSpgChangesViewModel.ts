import { useQuery } from "@tanstack/react-query";
import {
  listServiceProvidingGroupMembershipHistory,
  ListServiceProvidingGroupMembershipHistoryData,
  ServiceProvidingGroupMembershipHistory,
} from "../../generated-client";
import { throwOnError } from "../../util";

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

const fetchSnapshot = async (
  spgId: number,
  asOf: string,
): Promise<Map<number, ServiceProvidingGroupMembershipHistory>> => {
  const query: WithNestedFilter<
    ListServiceProvidingGroupMembershipHistoryData["query"]
  > = {
    service_providing_group_id: `eq.${spgId}`,
    as_of: asOf,
    valid_at: new Date().toISOString(),
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

const fetchSpgChanges = async (
  spgId: number,
  asOf: string,
): Promise<SpgChangeRow[]> => {
  const [oldSnapshot, currentSnapshot] = await Promise.all([
    fetchSnapshot(spgId, asOf),
    fetchSnapshot(spgId, new Date().toISOString()),
  ]);

  const allIds = new Set([...oldSnapshot.keys(), ...currentSnapshot.keys()]);

  const rows: SpgChangeRow[] = Array.from(allIds).map((id) => {
    const oldMembership = oldSnapshot.get(id);
    const newMembership = currentSnapshot.get(id);
    const oldCu = oldMembership?.controllable_unit_history?.[0];
    const newCu = newMembership?.controllable_unit_history?.[0];

    let status: SpgChangeStatus;
    if (!oldMembership && newMembership) {
      status = "added";
    } else if (oldMembership && !newMembership) {
      status = "removed";
    } else if (
      oldMembership &&
      newMembership &&
      oldCu &&
      newCu &&
      (oldCu.name !== newCu.name ||
        oldCu.maximum_active_power !== newCu.maximum_active_power ||
        oldMembership.valid_from !== newMembership.valid_from ||
        oldMembership.valid_to !== newMembership.valid_to)
    ) {
      status = "changed";
    } else {
      status = "unchanged";
    }

    return {
      id,
      status,
      old: oldMembership,
      new: newMembership,
      firstChange: minDate(oldMembership?.replaced_at, oldCu?.replaced_at),
      lastChange: maxDate(newMembership?.recorded_at, newCu?.recorded_at),
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
  asOf: string | undefined,
) => ["serviceProvidingGroupChanges", spgId, asOf];

export const useSpgChangesViewModel = (
  spgId: number | undefined,
  asOf: string | undefined,
) => {
  return useQuery({
    queryKey: spgChangesQueryKey(spgId, asOf),
    queryFn: () => fetchSpgChanges(spgId ?? 0, asOf ?? ""),
    enabled: !!spgId && !!asOf,
  });
};

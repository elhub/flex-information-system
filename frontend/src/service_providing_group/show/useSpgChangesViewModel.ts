import { useQuery } from "@tanstack/react-query";
import {
  listServiceProvidingGroupMembership,
  listServiceProvidingGroupMembershipHistory,
  ListServiceProvidingGroupMembershipData,
  ListServiceProvidingGroupMembershipHistoryData,
} from "../../generated-client";
import { throwOnError } from "../../util";

export type SpgChangeStatus = "added" | "removed" | "changed" | "unchanged";

export type SpgChangeRow = {
  id: number;
  status: SpgChangeStatus;
  oldName: string | undefined;
  newName: string | undefined;
  oldMaximumActivePower: number | undefined;
  newMaximumActivePower: number | undefined;
  oldValidFrom: string | undefined;
  oldValidTo: string | undefined;
  newValidFrom: string | undefined;
  newValidTo: string | undefined;
};

type CuSnapshot = {
  id: number;
  name: string;
  maximum_active_power: number;
  validFrom: string | undefined;
  validTo: string | undefined;
};

type WithNestedFilter<Query> = Query & Record<string, string>;

const fetchOldSnapshot = async (
  spgId: number,
  asOf: string,
): Promise<Map<number, CuSnapshot>> => {
  const query: WithNestedFilter<
    ListServiceProvidingGroupMembershipHistoryData["query"]
  > = {
    service_providing_group_id: `eq.${spgId}`,
    as_of: asOf,
    embed: "controllable_unit_history",
    "controllable_unit_history.as_of": asOf,
  };

  const memberships = await listServiceProvidingGroupMembershipHistory({
    query,
  }).then(throwOnError);

  const snapshot = new Map<number, CuSnapshot>();
  for (const membership of memberships) {
    const cu = membership.controllable_unit_history?.[0];
    if (!cu) continue;
    snapshot.set(membership.controllable_unit_id, {
      id: cu.controllable_unit_id,
      name: cu.name,
      maximum_active_power: cu.maximum_active_power,
      validFrom: membership.valid_from,
      validTo: membership.valid_to,
    });
  }
  return snapshot;
};

const fetchCurrentSnapshot = async (
  spgId: number,
): Promise<Map<number, CuSnapshot>> => {
  const query: ListServiceProvidingGroupMembershipData["query"] = {
    service_providing_group_id: `eq.${spgId}`,
    embed: "controllable_unit",
  };

  const memberships = await listServiceProvidingGroupMembership({
    query,
  }).then(throwOnError);

  const snapshot = new Map<number, CuSnapshot>();
  for (const membership of memberships) {
    const cu = membership.controllable_unit;
    if (!cu) continue;
    snapshot.set(membership.controllable_unit_id, {
      id: cu.id,
      name: cu.name,
      maximum_active_power: cu.maximum_active_power,
      validFrom: membership.valid_from,
      validTo: membership.valid_to,
    });
  }
  return snapshot;
};

const fetchSpgChanges = async (
  spgId: number,
  asOf: string,
): Promise<SpgChangeRow[]> => {
  const [oldSnapshot, currentSnapshot] = await Promise.all([
    fetchOldSnapshot(spgId, asOf),
    fetchCurrentSnapshot(spgId),
  ]);

  const allIds = new Set([...oldSnapshot.keys(), ...currentSnapshot.keys()]);

  const rows: SpgChangeRow[] = Array.from(allIds).map((id) => {
    const oldCu = oldSnapshot.get(id);
    const newCu = currentSnapshot.get(id);

    let status: SpgChangeStatus;
    if (!oldCu && newCu) {
      status = "added";
    } else if (oldCu && !newCu) {
      status = "removed";
    } else if (
      oldCu &&
      newCu &&
      (oldCu.name !== newCu.name ||
        oldCu.maximum_active_power !== newCu.maximum_active_power ||
        oldCu.validFrom !== newCu.validFrom ||
        oldCu.validTo !== newCu.validTo)
    ) {
      status = "changed";
    } else {
      status = "unchanged";
    }

    return {
      id,
      status,
      oldName: oldCu?.name,
      newName: newCu?.name,
      oldMaximumActivePower: oldCu?.maximum_active_power,
      newMaximumActivePower: newCu?.maximum_active_power,
      oldValidFrom: oldCu?.validFrom,
      oldValidTo: oldCu?.validTo,
      newValidFrom: newCu?.validFrom,
      newValidTo: newCu?.validTo,
    };
  });

  rows.sort((a, b) =>
    (a.newName ?? a.oldName ?? "").localeCompare(b.newName ?? b.oldName ?? ""),
  );

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

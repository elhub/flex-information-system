import {
  findCurrentlyValidRecord,
  throwOnError,
  toDateString,
} from "../../util";
import { useQuery } from "@tanstack/react-query";
import {
  listAccountingPointBalanceResponsibleParty,
  listServiceProvidingGroupMembership,
  readParty,
} from "../../generated-client";

export type SpgControllableUnitRow = {
  id: number;
  membershipId: number;
  name: string;
  validFrom: string;
  validTo: string;
  maximum_active_power: number;
  rated_power: number | undefined;
  regulation_direction: string;
  accountingPointId?: number;
  location?: string;
  mpid?: string;
  brpName: string;
  substationBusinessId: string | null;
};

const fetchSpgControllableUnits = async (
  spgId: number,
  substationBusinessId: string,
): Promise<SpgControllableUnitRow[]> => {
  const query: Record<string, string> = {
    embed: "controllable_unit!(summary,accounting_point!(grid_location!))",
    valid_at: new Date().toISOString(),
    service_providing_group_id: `eq.${spgId}`,
    "controllable_unit.accounting_point.grid_location.business_id": `eq.${substationBusinessId}`,
  };

  const memberships = await listServiceProvidingGroupMembership({
    query,
  }).then(throwOnError);

  const controllableUnits = memberships
    .map((m) => m.controllable_unit)
    .filter((cu): cu is NonNullable<typeof cu> => !!cu);

  const accountingPointIds = Array.from(
    new Set(controllableUnits.map((cu) => cu.accounting_point_id)),
  );

  const brpResults =
    accountingPointIds.length > 0
      ? await Promise.all(
          accountingPointIds.map((apId) =>
            listAccountingPointBalanceResponsibleParty({
              query: { accounting_point_id: `eq.${apId}` },
            }).then(throwOnError),
          ),
        )
      : [];

  const currentBrps = new Map<number, number | undefined>();
  const brpPartyIds = new Set<number>();
  accountingPointIds.forEach((apId, index) => {
    const current = findCurrentlyValidRecord(brpResults[index]);
    const brpId = current?.balance_responsible_party_id ?? undefined;
    currentBrps.set(apId, brpId);
    if (brpId) brpPartyIds.add(brpId);
  });

  const brpParties =
    brpPartyIds.size > 0
      ? await Promise.all(
          Array.from(brpPartyIds).map((id) =>
            readParty({ path: { id } }).then(throwOnError),
          ),
        )
      : [];
  const brpPartyMap = Object.fromEntries(brpParties.map((p) => [p.id, p]));

  return memberships
    .filter((m) => m.controllable_unit)
    .map((m) => {
      const cu = m.controllable_unit!;
      const ap = cu.accounting_point;
      const brpId = currentBrps.get(cu.accounting_point_id);
      return {
        id: cu.id,
        membershipId: m.id,
        name: cu.name,
        validFrom: toDateString(m.valid_from),
        validTo: toDateString(m.valid_to),
        maximum_active_power: cu.maximum_active_power,
        rated_power: cu.summary?.technical_resource?.maximum_active_power?.sum,
        regulation_direction: cu.regulation_direction,
        accountingPointId: cu.accounting_point_id,
        location: ap?.business_id,
        mpid: ap?.business_id,
        brpName: brpId ? (brpPartyMap[brpId]?.name ?? "-") : "-",
        substationBusinessId: ap?.grid_location?.business_id ?? null,
      };
    });
};

export const useSpgControllableUnits = (
  spgId: number | undefined,
  substationBusinessId: string | undefined,
) =>
  useQuery({
    queryKey: ["spg_cu", spgId, substationBusinessId],
    queryFn: () =>
      fetchSpgControllableUnits(spgId ?? 0, substationBusinessId ?? ""),
    enabled: !!spgId && !!substationBusinessId,
  });

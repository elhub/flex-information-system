import {
  findCurrentlyValidRecord,
  throwOnError,
  toDateString,
} from "../../util";
import { useQueries } from "@tanstack/react-query";
import { listServiceProvidingGroupMembership } from "../../generated-client";

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
    embed:
      "controllable_unit!(summary,accounting_point!(grid_location!,balance_responsible_party!(balance_responsible_party!)))",
    valid_at: new Date().toISOString(),
    service_providing_group_id: `eq.${spgId}`,
    "controllable_unit.accounting_point.grid_location.business_id": `eq.${substationBusinessId}`,
  };

  const memberships = await listServiceProvidingGroupMembership({
    query,
  }).then(throwOnError);

  return memberships
    .filter((m) => m.controllable_unit)
    .map((m) => {
      const cu = m.controllable_unit!;
      const ap = cu.accounting_point;
      const brp = findCurrentlyValidRecord(ap?.balance_responsible_party ?? []);
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
        brpName: brp?.balance_responsible_party?.name ?? "-",
        substationBusinessId: ap?.grid_location?.business_id ?? null,
      };
    });
};

const spgControllableUnitsQueryKey = (
  spgId: number | undefined,
  substationBusinessId: string,
) => ["spg_cu", spgId, substationBusinessId];

export const useSpgControllableUnitsMap = (
  spgId: number | undefined,
  substationBusinessIds: string[],
): Map<string, SpgControllableUnitRow[] | undefined> => {
  const results = useQueries({
    queries: substationBusinessIds.map((substationBusinessId) => ({
      queryKey: spgControllableUnitsQueryKey(spgId, substationBusinessId),
      queryFn: () =>
        fetchSpgControllableUnits(spgId ?? 0, substationBusinessId),
      enabled: !!spgId,
    })),
  });

  return new Map(
    substationBusinessIds.map((substationBusinessId, index) => [
      substationBusinessId,
      results[index]?.data,
    ]),
  );
};

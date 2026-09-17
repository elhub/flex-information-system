import { toDateString, throwOnError } from "../../util";
import { useQuery } from "@tanstack/react-query";
import { listServiceProvidingGroupMembership } from "../../generated-client";

export type SpgControllableUnitRow = {
  id: number;
  membershipId: number;
  name: string;
  validFrom: string;
  validTo: string;
  maximum_active_power: number;
  regulation_direction: string;
  accountingPointId?: string;
  substationBusinessId: string | null;
};

const fetchSpgControllableUnits = async (
  spgId: number,
  substationBusinessId: string,
): Promise<SpgControllableUnitRow[]> => {
  const query: Record<string, string> = {
    embed: "controllable_unit!(accounting_point!(grid_location!))",
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
      return {
        id: cu.id,
        membershipId: m.id,
        name: cu.name,
        validFrom: toDateString(m.valid_from),
        validTo: toDateString(m.valid_to),
        maximum_active_power: cu.maximum_active_power,
        regulation_direction: cu.regulation_direction,
        accountingPointId: cu?.accounting_point?.business_id,
        substationBusinessId:
          cu.accounting_point?.grid_location?.business_id ?? null,
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

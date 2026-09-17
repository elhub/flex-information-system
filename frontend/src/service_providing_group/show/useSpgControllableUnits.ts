import { fetchJSON, toDateString } from "../../util";
import { useQuery } from "@tanstack/react-query";
import { ServiceProvidingGroupMembership } from "../../generated-client";
import { SubstationRow } from "./useSpgPowerPerSubstation";
import { apiURL } from "../../httpConfig";

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
): Promise<SpgControllableUnitRow[]> => {
  const queryParams = new URLSearchParams({
    embed: "controllable_unit(summary,accounting_point(grid_location))",
    valid_at: new Date().toISOString(),
    service_providing_group_id: `eq.${spgId}`,
  });

  const memberships = await fetchJSON<ServiceProvidingGroupMembership>(
    `${apiURL}/service_providing_group_membership?${queryParams.toString()}`,
  );

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

export const useSpgControllableUnits = (spgId: number | undefined) =>
  useQuery({
    queryKey: ["spg_cu", spgId],
    queryFn: () => fetchSpgControllableUnits(spgId ?? 0),
    enabled: !!spgId,
  });

export const controllableUnitsForSubstation = (
  cus: SpgControllableUnitRow[] | undefined,
  substationBusinessId: SubstationRow["substationBusinessId"],
): SpgControllableUnitRow[] =>
  (cus ?? []).filter((cu) =>
    substationBusinessId === null
      ? cu.substationBusinessId === null
      : cu.substationBusinessId === substationBusinessId,
  );

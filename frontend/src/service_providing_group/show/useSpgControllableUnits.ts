import { throwOnError, toDateString } from "../../util";
import { useQuery } from "@tanstack/react-query";
import { listServiceProvidingGroupMembership } from "../../generated-client";
import { SubstationRow } from "./useSpgPowerPerSubstation";

export type SpgControllableUnitRow = {
  id: number;
  membershipId: number;
  name: string;
  validFrom: string;
  validTo: string;
  maximum_active_power: number;
  rated_power: number | undefined;
  regulation_direction: string;
  accountingPointId: number;
  status: string;
  substationBusinessId: string | null;
};

const fetchSpgControllableUnits = async (
  spgId: number,
): Promise<SpgControllableUnitRow[]> => {
  const memberships = await listServiceProvidingGroupMembership({
    query: {
      service_providing_group_id: `eq.${spgId}`,
      embed: "controllable_unit(accounting_point(grid_location))",
    },
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
        rated_power: cu.summary?.technical_resource?.maximum_active_power?.sum,
        regulation_direction: cu.regulation_direction,
        accountingPointId: cu.accounting_point_id,
        status: cu.status,
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

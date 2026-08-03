import { useQuery } from "@tanstack/react-query";
import { readServiceProvidingGroupPowerPerSubstation } from "../../generated-client";
import { throwOnError } from "../../util";

export type SubstationRow = {
  id: string;
  substationBusinessId: string | null;
  substationName: string | null;
  controllableUnitCount: number;
  maximumActivePowerSum: number | undefined;
  maximumActivePowerAverage: number | undefined;
  maximumActivePowerMin: number | undefined;
  maximumActivePowerMax: number | undefined;
};

const fetchSpgPowerPerSubstation = async (
  spgId: number,
): Promise<SubstationRow[]> => {
  const data = await readServiceProvidingGroupPowerPerSubstation({
    path: { id: spgId },
  }).then(throwOnError);

  return data.substations.map((s, i) => ({
    id: s.substation_business_id ?? `unassigned-${i}`,
    substationBusinessId: s.substation_business_id ?? null,
    substationName: s.substation_name ?? null,
    controllableUnitCount: s.controllable_unit?.count ?? 0,
    maximumActivePowerSum: s.controllable_unit?.maximum_active_power?.sum,
    maximumActivePowerAverage:
      s.controllable_unit?.maximum_active_power?.average,
    maximumActivePowerMin: s.controllable_unit?.maximum_active_power?.min,
    maximumActivePowerMax: s.controllable_unit?.maximum_active_power?.max,
  }));
};

export const useSpgPowerPerSubstation = (spgId: number | undefined) =>
  useQuery({
    queryKey: ["spg_power_per_substation", spgId],
    queryFn: () => fetchSpgPowerPerSubstation(spgId ?? 0),
    enabled: !!spgId,
  });

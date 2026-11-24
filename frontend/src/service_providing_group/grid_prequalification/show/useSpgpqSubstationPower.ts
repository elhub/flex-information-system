import { useQuery } from "@tanstack/react-query";
import { listServiceProvidingGroupGridPrequalificationSubstationPower } from "../../../generated-client";
import { throwOnError } from "../../../util";

export type SpgpqSubstationPowerRow = {
  id: string;
  substationBusinessId: string;
  substationName: string;
  controllableUnitCount: number;
  maximumActivePowerSum: number;
  totalApprovedMaximumActivePowerSum: number;
};

export const fetchSpgpqSubstationPower = async (
  spgpqId: number,
): Promise<SpgpqSubstationPowerRow[]> => {
  const data =
    await listServiceProvidingGroupGridPrequalificationSubstationPower({
      query: {
        service_providing_group_grid_prequalification_id: `eq.${spgpqId}`,
        order: "substation_name.asc",
      },
    }).then(throwOnError);

  return data.map((row) => ({
    id: row.substation_business_id,
    substationBusinessId: row.substation_business_id,
    substationName: row.substation_name,
    controllableUnitCount: row.controllable_unit_count,
    maximumActivePowerSum: row.maximum_active_power,
    totalApprovedMaximumActivePowerSum: row.total_approved_maximum_active_power,
  }));
};

export const useSpgpqSubstationPower = (spgpqId: number | undefined) =>
  useQuery({
    queryKey: [
      "service_providing_group_grid_prequalification_substation_power",
      spgpqId,
    ],
    queryFn: () => fetchSpgpqSubstationPower(spgpqId ?? 0),
    enabled: !!spgpqId,
  });

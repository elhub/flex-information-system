import { useQuery } from "@tanstack/react-query";
import { listControllableUnit } from "../../generated-client";
import { throwOnError } from "../../util";

export type AccountingPointControllableUnitRow = {
  id: number;
  name: string;
  maximum_active_power: number;
  rated_power: number | undefined;
  regulation_direction: string;
  status: string;
  additional_information: string | undefined;
  recorded_at: string;
};

type AccountingPointControllableUnitsResult = {
  rows: AccountingPointControllableUnitRow[];
};

const fetchAccountingPointControllableUnits = async (
  accountingPointId: number,
): Promise<AccountingPointControllableUnitsResult> => {
  const controllableUnits = await listControllableUnit({
    query: {
      accounting_point_id: `eq.${accountingPointId}`,
      embed: "summary",
      order: "id.desc",
    },
  }).then(throwOnError);

  return {
    rows: controllableUnits.map((cu) => ({
      id: cu.id,
      name: cu.name,
      maximum_active_power: cu.maximum_active_power,
      rated_power: cu.summary?.technical_resource?.maximum_active_power?.sum,
      regulation_direction: cu.regulation_direction,
      status: cu.status,
      additional_information: cu.additional_information,
      recorded_at: cu.recorded_at,
    })),
  };
};

export const accountingPointControllableUnitsQueryKey = (
  accountingPointId: number | undefined,
) => ["accountingPointControllableUnits", accountingPointId];

export const useAccountingPointControllableUnits = (
  accountingPointId: number | undefined,
) =>
  useQuery({
    queryKey: accountingPointControllableUnitsQueryKey(accountingPointId),
    queryFn: () =>
      fetchAccountingPointControllableUnits(accountingPointId ?? 0),
    enabled: !!accountingPointId,
  });

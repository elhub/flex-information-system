import {
  AccountingPoint,
  AccountingPointBalanceResponsibleParty,
  AccountingPointBiddingZone,
  AccountingPointEndUser,
  AccountingPointEnergySupplier,
  AccountingPointMeteringGridArea,
  listAccountingPointBalanceResponsibleParty,
  listAccountingPointBiddingZone,
  listAccountingPointEndUser,
  listAccountingPointEnergySupplier,
  listAccountingPointMeteringGridArea,
} from "../../generated-client";

import { useQuery, UseQueryResult } from "@tanstack/react-query";
import { throwOnError } from "../../util";

export type AccountingPointShowViewModel = {
  accountingPoint: AccountingPoint;
  connections: {
    balance_responsible_party_id?: number;
    bidding_zone?: string;
    end_user_id?: number;
    energy_supplier_id?: number;
    metering_grid_area_id?: number;
  };
};

// helper to find the currently valid record from a timeline
// TODO: either move to utils or replace with a better query on API calls
const findCurrentlyValidRecord = <
  T extends { valid_from?: string; valid_to?: string },
>(
  data: T[] | undefined,
): T | undefined => {
  if (!data) return undefined;

  const now = new Date();
  return data.find((record) => {
    const validFrom = record.valid_from ? new Date(record.valid_from) : null;
    const validTo = record.valid_to ? new Date(record.valid_to) : null;

    // deleted or in the future -> skip
    if (validFrom === null || validFrom > now) return false;
    // expired -> skip
    if (validTo !== null && validTo <= now) return false;
    // remaining case: currently valid
    return true;
  });
};

const getAccountingPointData = async (
  accountingPoint: AccountingPoint | undefined,
): Promise<Omit<AccountingPointShowViewModel, "accountingPoint">> => {
  if (!accountingPoint) {
    throw new Error("Accounting point not found");
  }

  const brpData = await listAccountingPointBalanceResponsibleParty({
    query: { accounting_point_id: "eq." + accountingPoint.id },
  }).then(throwOnError);
  const currentBRP =
    findCurrentlyValidRecord<AccountingPointBalanceResponsibleParty>(brpData);

  const bzData = await listAccountingPointBiddingZone({
    query: { accounting_point_id: "eq." + accountingPoint.id },
  }).then(throwOnError);
  const currentBiddingZone =
    findCurrentlyValidRecord<AccountingPointBiddingZone>(bzData);

  const euData = await listAccountingPointEndUser({
    query: { accounting_point_id: "eq." + accountingPoint.id },
  }).then(throwOnError);
  const currentEndUser =
    findCurrentlyValidRecord<AccountingPointEndUser>(euData);

  const esData = await listAccountingPointEnergySupplier({
    query: { accounting_point_id: "eq." + accountingPoint.id },
  }).then(throwOnError);
  const currentEnergySupplier =
    findCurrentlyValidRecord<AccountingPointEnergySupplier>(esData);

  const mgaData = await listAccountingPointMeteringGridArea({
    query: { accounting_point_id: "eq." + accountingPoint.id },
  }).then(throwOnError);
  const currentMGA =
    findCurrentlyValidRecord<AccountingPointMeteringGridArea>(mgaData);

  return {
    connections: {
      balance_responsible_party_id: currentBRP?.balance_responsible_party_id,
      bidding_zone: currentBiddingZone?.bidding_zone,
      end_user_id: currentEndUser?.end_user_id,
      energy_supplier_id: currentEnergySupplier?.energy_supplier_id,
      metering_grid_area_id: currentMGA?.metering_grid_area_id,
    },
  };
};

export const accountingPointViewModelQueryKey = (
  accountingPointId: number | undefined,
) => ["accountingPointViewModel", accountingPointId];

export const useAccountingPointViewModel = (
  accountingPoint: AccountingPoint | undefined,
): UseQueryResult<AccountingPointShowViewModel> => {
  const query = useQuery({
    queryKey: accountingPointViewModelQueryKey(accountingPoint?.id),
    queryFn: () => getAccountingPointData(accountingPoint),
    enabled: !!accountingPoint?.id,
  });

  return {
    ...query,
    data: {
      ...query.data,
      accountingPoint: accountingPoint,
    },
  } as UseQueryResult<AccountingPointShowViewModel>;
};

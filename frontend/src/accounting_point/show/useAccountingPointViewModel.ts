import {
  AccountingPoint,
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

const getAccountingPointData = async (
  accountingPoint: AccountingPoint | undefined,
): Promise<Omit<AccountingPointShowViewModel, "accountingPoint">> => {
  if (!accountingPoint) {
    throw new Error("Accounting point not found");
  }

  const now = new Date().toISOString();

  const brpData = await listAccountingPointBalanceResponsibleParty({
    query: {
      accounting_point_id: "eq." + accountingPoint.id,
      valid_at: now,
    },
  }).then(throwOnError);
  const currentBRP = brpData.length > 0 ? brpData[0] : undefined;

  const bzData = await listAccountingPointBiddingZone({
    query: {
      accounting_point_id: "eq." + accountingPoint.id,
      valid_at: now,
    },
  }).then(throwOnError);
  const currentBiddingZone = bzData.length > 0 ? bzData[0] : undefined;

  const euData = await listAccountingPointEndUser({
    query: {
      accounting_point_id: "eq." + accountingPoint.id,
      valid_at: now,
    },
  }).then(throwOnError);
  const currentEndUser = euData.length > 0 ? euData[0] : undefined;

  const esData = await listAccountingPointEnergySupplier({
    query: {
      accounting_point_id: "eq." + accountingPoint.id,
      valid_at: now,
    },
  }).then(throwOnError);
  const currentEnergySupplier = esData.length > 0 ? esData[0] : undefined;

  const mgaData = await listAccountingPointMeteringGridArea({
    query: {
      accounting_point_id: "eq." + accountingPoint.id,
      valid_at: now,
    },
  }).then(throwOnError);
  const currentMGA = mgaData.length > 0 ? mgaData[0] : undefined;

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

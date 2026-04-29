import {
  AccountingPoint,
  AccountingPointGridLocation,
  MeteringGridArea,
  Party,
  listAccountingPointBalanceResponsibleParty,
  listAccountingPointBiddingZone,
  listAccountingPointEndUser,
  listAccountingPointEnergySupplier,
  listAccountingPointGridLocation,
  listAccountingPointMeteringGridArea,
  readAccountingPoint,
  readMeteringGridArea,
  readParty,
} from "../../generated-client";

import { useQuery, UseQueryResult } from "@tanstack/react-query";
import { throwOnError } from "../../util";

export type AccountingPointShowViewModel = {
  accountingPoint: AccountingPoint;
  gridLocation: AccountingPointGridLocation | undefined;
  biddingZone: string | undefined;
  balanceResponsibleParty: Party | undefined;
  endUser: Party | undefined;
  energySupplier: Party | undefined;
  systemOperator: Party | undefined;
  meteringGridArea: MeteringGridArea | undefined;
};

const getAccountingPointData = async (
  id: number,
): Promise<AccountingPointShowViewModel> => {
  const accountingPoint = await readAccountingPoint({
    path: { id },
  }).then(throwOnError);

  const now = new Date().toISOString();

  const [brpData, bzData, euData, esData, mgaData] = await Promise.all([
    listAccountingPointBalanceResponsibleParty({
      query: {
        accounting_point_id: "eq." + accountingPoint.id,
        valid_at: now,
      },
    }).then(throwOnError),
    listAccountingPointBiddingZone({
      query: {
        accounting_point_id: "eq." + accountingPoint.id,
        valid_at: now,
      },
    }).then(throwOnError),
    listAccountingPointEndUser({
      query: {
        accounting_point_id: "eq." + accountingPoint.id,
        valid_at: now,
      },
    }).then(throwOnError),
    listAccountingPointEnergySupplier({
      query: {
        accounting_point_id: "eq." + accountingPoint.id,
        valid_at: now,
      },
    }).then(throwOnError),
    listAccountingPointMeteringGridArea({
      query: {
        accounting_point_id: "eq." + accountingPoint.id,
        valid_at: now,
      },
    }).then(throwOnError),
  ]);

  const gridLocationResult = await listAccountingPointGridLocation({
    query: { accounting_point_id: "eq." + accountingPoint.id },
  });
  const gridLocation =
    gridLocationResult.response.status === 403
      ? undefined
      : throwOnError(gridLocationResult)[0];

  const currentBRP = brpData[0];
  const currentBZ = bzData[0];
  const currentEU = euData[0];
  const currentES = esData[0];
  const currentMGA = mgaData[0];

  const [
    balanceResponsibleParty,
    endUser,
    energySupplier,
    systemOperator,
    meteringGridArea,
  ] = await Promise.all([
    currentBRP?.balance_responsible_party_id
      ? readParty({
          path: { id: currentBRP.balance_responsible_party_id },
        }).then(throwOnError)
      : Promise.resolve(undefined),
    currentEU?.end_user_id
      ? readParty({ path: { id: currentEU.end_user_id } }).then(throwOnError)
      : Promise.resolve(undefined),
    currentES?.energy_supplier_id
      ? readParty({ path: { id: currentES.energy_supplier_id } }).then(
          throwOnError,
        )
      : Promise.resolve(undefined),
    accountingPoint.system_operator_id
      ? readParty({ path: { id: accountingPoint.system_operator_id } }).then(
          throwOnError,
        )
      : Promise.resolve(undefined),
    currentMGA?.metering_grid_area_id
      ? readMeteringGridArea({
          path: { id: currentMGA.metering_grid_area_id },
        }).then(throwOnError)
      : Promise.resolve(undefined),
  ]);

  return {
    accountingPoint,
    gridLocation,
    biddingZone: currentBZ?.bidding_zone,
    balanceResponsibleParty,
    endUser,
    energySupplier,
    systemOperator,
    meteringGridArea,
  };
};

export const accountingPointViewModelQueryKey = (
  accountingPointId: number | undefined,
) => ["accountingPointViewModel", accountingPointId];

export const useAccountingPointViewModel = (
  id: number | undefined,
): UseQueryResult<AccountingPointShowViewModel> => {
  return useQuery({
    queryKey: accountingPointViewModelQueryKey(id),
    queryFn: () => getAccountingPointData(id!),
    enabled: !!id,
  });
};

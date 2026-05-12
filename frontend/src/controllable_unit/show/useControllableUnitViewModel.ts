import {
  AccountingPoint,
  AccountingPointBalanceResponsibleParty,
  ControllableUnit,
  ControllableUnitHistory,
  ControllableUnitServiceProvider,
  ControllableUnitSuspension,
  listAccountingPointBalanceResponsibleParty,
  listAccountingPointBiddingZone,
  listControllableUnitServiceProvider,
  listControllableUnitSuspension,
  listTechnicalResource,
  Party,
  readAccountingPoint,
  readControllableUnit,
  readParty,
  TechnicalResource,
} from "../../generated-client";

import { useQuery, UseQueryResult } from "@tanstack/react-query";
import { findCurrentlyValidRecord, throwOnError } from "../../util";

export type ControllableUnitShowViewModel = {
  controllableUnit: ControllableUnit | ControllableUnitHistory;
  serviceProvider: Party | undefined;
  controllableUnitServiceProvider: ControllableUnitServiceProvider | undefined;
  technicalResources: TechnicalResource[] | undefined;
  systemOperator: Party | undefined;
  accountingPoint: AccountingPoint | undefined;
  suspensions: ControllableUnitSuspension[] | undefined;
  balanceResponsibleParty: Party | undefined;
  accountingPointBalanceResponsibleParty:
    | AccountingPointBalanceResponsibleParty
    | undefined;
  biddingZone: string | undefined;
};

const findCurrentCusp = async (controllableUnitId: number) => {
  const cuspList = await listControllableUnitServiceProvider({
    query: { controllable_unit_id: "eq." + controllableUnitId },
  }).then(throwOnError);

  const currentCusp = cuspList.find(
    (cusp) =>
      cusp.valid_from &&
      new Date(cusp.valid_from) <= new Date() &&
      (!cusp.valid_to || new Date(cusp.valid_to) >= new Date()),
  );

  if (!currentCusp) {
    return { cusp: undefined, systemProvider: undefined };
  }

  const systemProvider = await readParty({
    path: { id: currentCusp?.service_provider_id ?? 0 },
  }).then(throwOnError);

  return { cusp: currentCusp, systemProvider };
};

const getCurrentBalanceResponsibleParty = async (accountingPointId: number) => {
  const balanceResponsibleParties =
    await listAccountingPointBalanceResponsibleParty({
      query: { accounting_point_id: "eq." + accountingPointId },
    }).then(throwOnError);

  const currentBalanceResponsibleParty = findCurrentlyValidRecord(
    balanceResponsibleParties,
  );

  if (!currentBalanceResponsibleParty) {
    return {
      balanceResponsibleParty: undefined,
      accountingPointBalanceResponsibleParty: undefined,
    };
  }

  const balanceResponsibleParty = await readParty({
    path: {
      id: currentBalanceResponsibleParty.balance_responsible_party_id ?? 0,
    },
  }).then(throwOnError);

  return {
    balanceResponsibleParty,
    accountingPointBalanceResponsibleParty: currentBalanceResponsibleParty,
  };
};

const getCurrentBiddingZone = async (accountingPointId: number) => {
  const biddingZones = await listAccountingPointBiddingZone({
    query: { accounting_point_id: "eq." + accountingPointId },
  }).then(throwOnError);

  const currentBiddingZone = findCurrentlyValidRecord(biddingZones);
  return currentBiddingZone?.bidding_zone;
};

const getAccountingPointData = async (
  accountingPointId: number | undefined,
) => {
  if (!accountingPointId) {
    return {
      accountingPoint: undefined,
      systemOperator: undefined,
      balanceResponsibleParty: undefined,
      accountingPointBalanceResponsibleParty: undefined,
      biddingZone: undefined,
    };
  }

  const accountingPoint = await readAccountingPoint({
    path: { id: accountingPointId },
  }).then(throwOnError);

  const systemOperatorPromise = readParty({
    path: { id: accountingPoint?.system_operator_id ?? 0 },
  }).then(throwOnError);

  const balanceResponsiblePartyPromise =
    getCurrentBalanceResponsibleParty(accountingPointId);

  const biddingZonePromise = getCurrentBiddingZone(accountingPointId);

  const [systemOperator, balanceResponsibleParty, biddingZone] =
    await Promise.all([
      systemOperatorPromise,
      balanceResponsiblePartyPromise,
      biddingZonePromise,
    ]);

  return {
    accountingPoint,
    systemOperator,
    balanceResponsibleParty: balanceResponsibleParty?.balanceResponsibleParty,
    accountingPointBalanceResponsibleParty:
      balanceResponsibleParty?.accountingPointBalanceResponsibleParty,
    biddingZone,
  };
};

export const getControllableUnitData = async (
  controllableUnitId: number,
): Promise<ControllableUnitShowViewModel> => {
  const controllableUnit = await readControllableUnit({
    path: { id: controllableUnitId },
  }).then(throwOnError);

  const technicalResourcesPromise = listTechnicalResource({
    query: { controllable_unit_id: "eq." + controllableUnitId },
  }).then(throwOnError);

  const accountingPointPromise = getAccountingPointData(
    controllableUnit?.accounting_point_id,
  );
  const cuspPromise = findCurrentCusp(controllableUnitId);

  const suspensionsPromise = listControllableUnitSuspension({
    query: { controllable_unit_id: "eq." + controllableUnitId },
  }).then(throwOnError);

  const [technicalResources, accountingPoint, cuspData, suspensions] =
    await Promise.all([
      technicalResourcesPromise,
      accountingPointPromise,
      cuspPromise,
      suspensionsPromise,
    ]);

  return {
    controllableUnit,
    serviceProvider: cuspData.systemProvider,
    technicalResources: technicalResources,
    systemOperator: accountingPoint.systemOperator,
    accountingPoint: accountingPoint.accountingPoint,
    balanceResponsibleParty: accountingPoint.balanceResponsibleParty,
    accountingPointBalanceResponsibleParty:
      accountingPoint.accountingPointBalanceResponsibleParty,
    biddingZone: accountingPoint.biddingZone,
    suspensions: suspensions,
    controllableUnitServiceProvider: cuspData.cusp,
  };
};

export const controllableUnitViewModelQueryKey = (
  controllableUnitId: number | undefined,
) => ["controllableUnitViewModel", controllableUnitId];

export const useControllableUnitViewModel = (
  id: number | undefined,
): UseQueryResult<ControllableUnitShowViewModel> => {
  return useQuery({
    queryKey: controllableUnitViewModelQueryKey(id),
    queryFn: () => getControllableUnitData(id!),
    enabled: !!id,
  });
};

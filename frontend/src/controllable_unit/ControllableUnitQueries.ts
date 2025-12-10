import {
  AccountingPoint,
  AccountingPointBalanceResponsibleParty,
  ControllableUnit,
  ControllableUnitHistoryResponse,
  ControllableUnitServiceProvider,
  ControllableUnitSuspension,
  listAccountingPointBalanceResponsibleParty,
  listControllableUnitServiceProvider,
  listControllableUnitSuspension,
  listTechnicalResource,
  Party,
  readAccountingPoint,
  readParty,
  TechnicalResource,
} from "../generated-client";

import { useQuery } from "@tanstack/react-query";

type Response<T> =
  | {
      data: T;
      error: undefined;
    }
  | {
      data: undefined;
      error: unknown;
    };

const throwOnError = <T>(response: Response<T>): T | undefined => {
  const { data, error } = response;
  if (error) {
    throw error;
  }
  return data;
};

type ControllableUnitShowViewModel = {
  controllableUnit: ControllableUnit | ControllableUnitHistoryResponse;
  serviceProvider: Party | undefined;
  ControllableUnitServiceProvider: ControllableUnitServiceProvider | undefined;
  technicalResources: TechnicalResource[] | undefined;
  systemOperator: Party | undefined;
  accountingPoint: AccountingPoint | undefined;
  suspensions: ControllableUnitSuspension[] | undefined;
  balanceResponsibleParty: Party | undefined;
  controllableUnitBalanceResponsibleParty:
    | AccountingPointBalanceResponsibleParty
    | undefined;
};

const findCurrentCusp = async (controllableUnitId: number) => {
  //TODO: need to fix specification to return the type cusp and not unknown array
  const cuspList = (await listControllableUnitServiceProvider({
    query: { controllable_unit_id: "eq." + controllableUnitId },
  }).then(throwOnError)) as ControllableUnitServiceProvider[];

  const currentCusp = cuspList.find(
    (cusp: ControllableUnitServiceProvider) =>
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
    })
      .then(throwOnError)
      .then((data) => data as AccountingPointBalanceResponsibleParty[]);

  const currentBalanceResponsibleParty = balanceResponsibleParties.find(
    (brp) =>
      brp.valid_from &&
      new Date(brp.valid_from) <= new Date() &&
      (!brp.valid_to || new Date(brp.valid_to) >= new Date()),
  );

  if (!currentBalanceResponsibleParty) {
    return undefined;
  }

  const balanceResponsibleParty = await readParty({
    path: {
      id: currentBalanceResponsibleParty.balance_responsible_party_id ?? 0,
    },
  }).then(throwOnError);

  return {
    balanceResponsibleParty,
    controllableUnitBalanceResponsibleParty: currentBalanceResponsibleParty,
  };
};

const getAccountingPointData = async (
  accountingPointId: number | undefined,
) => {
  if (!accountingPointId) {
    return { accountingPoint: undefined, systemOperator: undefined };
  }

  const accountingPoint = await readAccountingPoint({
    path: { id: accountingPointId },
  }).then(throwOnError);

  const systemOperatorPromise = readParty({
    path: { id: accountingPoint?.system_operator_id ?? 0 },
  }).then(throwOnError);

  const balanceResponsiblePartyPromise =
    getCurrentBalanceResponsibleParty(accountingPointId);

  const [systemOperator, balanceResponsibleParty] = await Promise.all([
    systemOperatorPromise,
    balanceResponsiblePartyPromise,
  ]);

  return { accountingPoint, systemOperator, ...balanceResponsibleParty };
};

const getControllableUnitData = async (
  controllableUnit: ControllableUnit | undefined,
): Promise<ControllableUnitShowViewModel> => {
  const controllableUnitIdInt = controllableUnit?.id ?? 0;

  if (!controllableUnit) {
    throw new Error("Controllable unit not found");
  }
  const technicalResourcesPromise = listTechnicalResource({
    query: { controllable_unit_id: "eq." + controllableUnitIdInt },
  }).then(throwOnError);

  const accountingPointPromise = getAccountingPointData(
    controllableUnit?.accounting_point_id,
  );
  const cuspPromise = findCurrentCusp(controllableUnitIdInt);

  const suspensionsPromise = listControllableUnitSuspension({
    query: { controllable_unit_id: "eq." + controllableUnitIdInt },
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
    technicalResources: technicalResources as TechnicalResource[] | undefined,
    systemOperator: accountingPoint.systemOperator,
    accountingPoint: accountingPoint.accountingPoint,
    balanceResponsibleParty: accountingPoint.balanceResponsibleParty,
    controllableUnitBalanceResponsibleParty:
      accountingPoint.controllableUnitBalanceResponsibleParty,
    suspensions: suspensions as ControllableUnitSuspension[] | undefined,
    ControllableUnitServiceProvider: cuspData.cusp,
  };
};

const controllableUnitViewModelQueryKey = (
  controllableUnitId: number | undefined,
) => ["controllableUnitViewModel", controllableUnitId];
export const useControllableUnitViewModel = (
  controllableUnit:
    | ControllableUnit
    | ControllableUnitHistoryResponse
    | undefined,
) => {
  return useQuery({
    queryKey: controllableUnitViewModelQueryKey(controllableUnit?.id),
    queryFn: () => getControllableUnitData(controllableUnit),
    enabled: !!controllableUnit?.id,
  });
};

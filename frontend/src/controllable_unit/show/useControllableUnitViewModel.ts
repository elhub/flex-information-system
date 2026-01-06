import {
  AccountingPoint,
  ControllableUnit,
  ControllableUnitHistoryResponse,
  ControllableUnitServiceProvider,
  ControllableUnitSuspension,
  EmptyObject,
  ErrorMessage,
  listAccountingPointBalanceResponsibleParty,
  listControllableUnitServiceProvider,
  listControllableUnitSuspension,
  listTechnicalResource,
  Party,
  readAccountingPoint,
  readParty,
  TechnicalResource,
} from "../../generated-client";

import { useQuery, UseQueryResult } from "@tanstack/react-query";

type Response<T> =
  | {
      data: T;
      error: undefined;
    }
  | {
      data: undefined;
      error: ErrorMessage | EmptyObject;
    };

const throwOnError = <T>(response: Response<T>): T => {
  const { data, error } = response;
  if (error) {
    throw error;
  }
  return data;
};

export type ControllableUnitShowViewModel = {
  controllableUnit: ControllableUnit | ControllableUnitHistoryResponse;
  serviceProvider: Party | undefined;
  controllableUnitServiceProvider: ControllableUnitServiceProvider | undefined;
  technicalResources: TechnicalResource[] | undefined;
  systemOperator: Party | undefined;
  accountingPoint: AccountingPoint | undefined;
  suspensions: ControllableUnitSuspension[] | undefined;
  balanceResponsibleParty: Party | undefined;
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

  const currentBalanceResponsibleParty = balanceResponsibleParties.find(
    (brp) =>
      brp.valid_from &&
      new Date(brp.valid_from) <= new Date() &&
      (!brp.valid_to || new Date(brp.valid_to) >= new Date()),
  );

  if (!currentBalanceResponsibleParty) {
    return {
      balanceResponsibleParty: undefined,
    };
  }

  const balanceResponsibleParty = await readParty({
    path: {
      id: currentBalanceResponsibleParty.balance_responsible_party_id ?? 0,
    },
  }).then(throwOnError);

  return {
    balanceResponsibleParty,
  };
};

const getAccountingPointData = async (
  accountingPointId: number | undefined,
) => {
  if (!accountingPointId) {
    return {
      accountingPoint: undefined,
      systemOperator: undefined,
      balanceResponsibleParty: undefined,
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

  const [systemOperator, balanceResponsibleParty] = await Promise.all([
    systemOperatorPromise,
    balanceResponsiblePartyPromise,
  ]);

  return {
    accountingPoint,
    systemOperator,
    balanceResponsibleParty: balanceResponsibleParty?.balanceResponsibleParty,
  };
};

const getControllableUnitData = async (
  controllableUnit: ControllableUnit | undefined,
): Promise<Omit<ControllableUnitShowViewModel, "controllableUnit">> => {
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
    serviceProvider: cuspData.systemProvider,
    technicalResources: technicalResources,
    systemOperator: accountingPoint.systemOperator,
    accountingPoint: accountingPoint.accountingPoint,
    balanceResponsibleParty: accountingPoint.balanceResponsibleParty,
    suspensions: suspensions,
    controllableUnitServiceProvider: cuspData.cusp,
  };
};

export const controllableUnitViewModelQueryKey = (
  controllableUnitId: number | undefined,
) => ["controllableUnitViewModel", controllableUnitId];
export const useControllableUnitViewModel = (
  controllableUnit:
    | ControllableUnit
    | ControllableUnitHistoryResponse
    | undefined,
): UseQueryResult<ControllableUnitShowViewModel> => {
  const query = useQuery({
    queryKey: controllableUnitViewModelQueryKey(controllableUnit?.id),
    queryFn: () => getControllableUnitData(controllableUnit),
    enabled: !!controllableUnit?.id,
  });

  return {
    ...query,
    data: query.data
      ? {
          ...query.data,
          controllableUnit,
        }
      : undefined,
    // Since controllable unit is prefetched, we dont want controllableUnit to be in the query logic, so we can partially invalidate the query when the controllable unit is updated
    // but for simplicity we want the controllable unit to be available in the view model, so we add it to the data
    // Thats why we return the query result and add the controllableUnit to the data, casting it manually since the types of useQuery are complex and not easily inferrable
  } as UseQueryResult<ControllableUnitShowViewModel>;
};

import { useQuery } from "@tanstack/react-query";
import {
  listAccountingPoint,
  listControllableUnit,
  listServiceProvidingGroupMembership,
  readServiceProvidingGroup,
} from "../../generated-client";
import { throwOnError, toDateString } from "../../util";

export type SpgMembershipRow = {
  id: number;
  controllableUnitName: string;
  validFrom: string;
  validTo: string;
  capacityKw: number;
  direction: string;
  mpid: string;
  status: string;
};

export type SpgShowViewModel = {
  rows: SpgMembershipRow[];
  totalCapacityKw: number;
  productionCapacityKw: number;
  consumptionCapacityKw: number;
};

const serviceProvidingGroupQueryKey = (spgId: number | undefined) => [
  "service_providing_group",
  spgId,
];
export const useServiceProvidingGroup = (spgId: number | undefined) =>
  useQuery({
    queryKey: serviceProvidingGroupQueryKey(spgId),
    queryFn: () =>
      readServiceProvidingGroup({ path: { id: spgId ?? 0 } }).then(
        throwOnError,
      ),
    enabled: !!spgId,
  });

const fetchSpgShowData = async (serviceProvidingGroupId: number) => {
  const memberships = await listServiceProvidingGroupMembership({
    query: {
      service_providing_group_id: `eq.${serviceProvidingGroupId}`,
      order: "id.desc",
      limit: "200",
    },
  }).then(throwOnError);

  if (memberships.length === 0) {
    return {
      rows: [],
      totalCapacityKw: 0,
      productionCapacityKw: 0,
      consumptionCapacityKw: 0,
    } satisfies SpgShowViewModel;
  }

  const controllableUnitIds = Array.from(
    new Set(memberships.map((membership) => membership.controllable_unit_id)),
  );

  const controllableUnits = await listControllableUnit({
    query: {
      id: `in.(${controllableUnitIds.join(",")})`,
      limit: "500",
    },
  }).then(throwOnError);

  const accountingPointIds = Array.from(
    new Set(controllableUnits.map((cu) => cu.accounting_point_id)),
  );

  const accountingPoints = await listAccountingPoint({
    query: {
      id: `in.(${accountingPointIds.join(",")})`,
      limit: "500",
    },
  }).then(throwOnError);

  const apMap = Object.fromEntries(accountingPoints.map((ap) => [ap.id, ap]));

  const rows: SpgMembershipRow[] = controllableUnits.map((controllableUnit) => {
    const accountingPoint = apMap[controllableUnit.accounting_point_id];
    const membership = memberships.find(
      (value) => value.controllable_unit_id === controllableUnit.id,
    );

    return {
      id: controllableUnit.id,
      controllableUnitName: controllableUnit.name,
      validFrom: toDateString(membership?.valid_from),
      validTo: toDateString(membership?.valid_to),
      capacityKw: controllableUnit.maximum_active_power,
      direction: controllableUnit.regulation_direction,
      mpid: accountingPoint?.business_id ?? "-",
      status: controllableUnit.status,
    };
  });

  const totalCapacityKw = rows.reduce((sum, row) => sum + row.capacityKw, 0);

  const productionCapacityKw = controllableUnits
    .filter(
      (controllableUnit) =>
        controllableUnit.regulation_direction === "up" ||
        controllableUnit.regulation_direction === "both",
    )
    .reduce(
      (sum, controllableUnit) => sum + controllableUnit.maximum_active_power,
      0,
    );

  const consumptionCapacityKw = controllableUnits
    .filter(
      (controllableUnit) =>
        controllableUnit.regulation_direction === "down" ||
        controllableUnit.regulation_direction === "both",
    )
    .reduce(
      (sum, controllableUnit) => sum + controllableUnit.maximum_active_power,
      0,
    );

  return {
    rows,
    totalCapacityKw,
    productionCapacityKw,
    consumptionCapacityKw,
  } satisfies SpgShowViewModel;
};

export const spgShowViewModelQueryKey = (spgId: number | undefined) => [
  "serviceProvidingGroupShowViewModel",
  spgId,
];

export const useSpgShowViewModel = (spgId: number | undefined) => {
  return useQuery({
    queryKey: spgShowViewModelQueryKey(spgId),
    queryFn: () => fetchSpgShowData(spgId ?? 0),
    enabled: !!spgId,
  });
};

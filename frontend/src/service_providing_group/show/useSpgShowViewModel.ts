import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  deleteServiceProvidingGroupMembership,
  listAccountingPoint,
  listControllableUnit,
  listServiceProvidingGroupMembership,
  readServiceProvidingGroup,
} from "../../generated-client";
import { throwOnError, toDateString } from "../../util";

export type SpgMembershipRow = {
  id: number;
  membershipId: number;
  name: string;
  validFrom: string;
  validTo: string;
  maximum_active_power: number;
  regulation_direction: string;
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

  const rows: SpgMembershipRow[] = controllableUnits.map((cu) => {
    const ap = apMap[cu.accounting_point_id];
    const membership = memberships.find(
      (m) => m.controllable_unit_id === cu.id,
    );

    return {
      id: cu.id,
      membershipId: membership!.id,
      name: cu.name,
      validFrom: toDateString(membership?.valid_from),
      validTo: toDateString(membership?.valid_to),
      maximum_active_power: cu.maximum_active_power,
      regulation_direction: cu.regulation_direction,
      mpid: ap?.business_id ?? "-",
      status: cu.status,
    };
  });

  const totalCapacityKw = controllableUnits.reduce(
    (sum, cu) => sum + cu.maximum_active_power,
    0,
  );

  const productionCapacityKw = controllableUnits
    .filter(
      (cu) =>
        cu.regulation_direction === "up" || cu.regulation_direction === "both",
    )
    .reduce((sum, cu) => sum + cu.maximum_active_power, 0);

  const consumptionCapacityKw = controllableUnits
    .filter(
      (cu) =>
        cu.regulation_direction === "down" ||
        cu.regulation_direction === "both",
    )
    .reduce((sum, cu) => sum + cu.maximum_active_power, 0);

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

export const useRemoveMembershipFromShow = (spgId: number) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (membershipId: number) =>
      deleteServiceProvidingGroupMembership({
        path: { id: membershipId },
      }).then(throwOnError),
    onSettled: () => {
      queryClient.invalidateQueries({
        queryKey: spgShowViewModelQueryKey(spgId),
      });
    },
  });
};

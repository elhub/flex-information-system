import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  deleteServiceProvidingGroupMembership,
  listAccountingPoint,
  listAccountingPointBalanceResponsibleParty,
  listControllableUnit,
  listServiceProvidingGroupMembership,
  readParty,
  readServiceProvidingGroup,
} from "../../generated-client";
import {
  findCurrentlyValidRecord,
  throwOnError,
  toDateString,
} from "../../util";

export type SpgMembershipRow = {
  id: number;
  membershipId: number | undefined;
  name: string;
  validFrom: string;
  validTo: string;
  maximum_active_power: number;
  regulation_direction: string;
  mpid: string;
  brpName: string;
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

  const apBrpResults = await Promise.all(
    accountingPointIds.map((apId) =>
      listAccountingPointBalanceResponsibleParty({
        query: { accounting_point_id: `eq.${apId}` },
      }).then(throwOnError),
    ),
  );

  const currentBrps = new Map<number, number | undefined>();
  const brpPartyIds = new Set<number>();
  accountingPointIds.forEach((apId, index) => {
    const current = findCurrentlyValidRecord(apBrpResults[index]);
    const brpId = current?.balance_responsible_party_id ?? undefined;
    currentBrps.set(apId, brpId);
    if (brpId) brpPartyIds.add(brpId);
  });

  const brpParties =
    brpPartyIds.size > 0
      ? await Promise.all(
          Array.from(brpPartyIds).map((id) =>
            readParty({ path: { id } }).then(throwOnError),
          ),
        )
      : [];
  const brpPartyMap = Object.fromEntries(brpParties.map((p) => [p.id, p]));

  const rows: SpgMembershipRow[] = controllableUnits.map((cu) => {
    const ap = apMap[cu.accounting_point_id];
    const membership = memberships.find(
      (m) => m.controllable_unit_id === cu.id,
    );

    return {
      id: cu.id,
      membershipId: membership?.id,
      name: cu.name,
      validFrom: toDateString(membership?.valid_from),
      validTo: toDateString(membership?.valid_to),
      maximum_active_power: cu.maximum_active_power,
      regulation_direction: cu.regulation_direction,
      mpid: ap?.business_id ?? "-",
      brpName: (() => {
        const brpId = currentBrps.get(cu.accounting_point_id);
        return brpId ? (brpPartyMap[brpId]?.name ?? "-") : "-";
      })(),
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

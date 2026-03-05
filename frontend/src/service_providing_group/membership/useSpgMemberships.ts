import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  AccountingPointBiddingZone,
  ControllableUnit,
  createServiceProvidingGroupMembership,
  deleteServiceProvidingGroupMembership,
  listAccountingPointBiddingZone,
  listControllableUnit,
  listServiceProvidingGroupMembership,
  listTechnicalResource,
  readAccountingPoint,
} from "../../generated-client";
import { throwOnError } from "../../util";
import { set } from "date-fns";

const fetchCurrentBiddingZone = async (
  accountingPointId: number,
): Promise<AccountingPointBiddingZone | undefined> => {
  const now = new Date().toISOString();
  const results = await listAccountingPointBiddingZone({
    query: {
      accounting_point_id: "eq." + accountingPointId,
      valid_from: "lte." + now,
      order: "valid_from.desc",
      limit: "1",
    },
  }).then(throwOnError);

  const record = results[0];
  if (!record) return undefined;

  return record;
};

const enrichControllableUnit = async (
  cu: ControllableUnit,
  membershipId: number | undefined,
) => {
  const [accountingPoint, technicalResources, currentBiddingZone] =
    await Promise.all([
      readAccountingPoint({
        path: { id: cu.accounting_point_id },
      }).then(throwOnError),
      listTechnicalResource({
        query: { controllable_unit_id: "eq." + cu.id },
      }).then(throwOnError),
      fetchCurrentBiddingZone(cu.accounting_point_id),
    ]);

  return {
    ...cu,
    membershipId,
    meteringPointBusinessId: accountingPoint.business_id,
    biddingZone: currentBiddingZone?.bidding_zone,
    technicalResourceCount: technicalResources.length,
  };
};

const fetchControllableUnitsInSpg = async (spgId: number) => {
  const memberships = await listServiceProvidingGroupMembership({
    query: { service_providing_group_id: "eq." + spgId },
  }).then(throwOnError);

  if (memberships.length === 0) {
    return [];
  }

  const membershipsById = Object.fromEntries(
    memberships.map((m) => [m.controllable_unit_id, m.id]),
  );

  const controllableUnits = await listControllableUnit({
    query: {
      id: `in.(${memberships.map((m) => m.controllable_unit_id).join(",")})`,
    },
  }).then(throwOnError);

  return Promise.all(
    controllableUnits.map((cu) =>
      enrichControllableUnit(cu, membershipsById[cu.id]),
    ),
  );
};

const fetchControllableUnitsNotInSpg = async (spgId: number) => {
  const memberships = await listServiceProvidingGroupMembership({
    query: { service_providing_group_id: "eq." + spgId },
  }).then(throwOnError);

  const membershipsById = Object.fromEntries(
    memberships.map((m) => [m.controllable_unit_id, m.id]),
  );

  const controllableUnits = await listControllableUnit({
    query: { id: `not.in.(${Object.keys(membershipsById).join(",")})` },
  }).then(throwOnError);

  return Promise.all(
    controllableUnits.map((cu) =>
      enrichControllableUnit(cu, membershipsById[cu.id]),
    ),
  );
};

export const controllableUnitsInSpgQueryKey = (spgId: number) => [
  "controllableUnitsInSpg",
  spgId,
];

export const controllableUnitsNotInSpgQueryKey = (spgId: number) => [
  "controllableUnitsNotInSpg",
  spgId,
];

export const useControllableUnitsInSpg = (spgId: number) =>
  useQuery({
    queryKey: controllableUnitsInSpgQueryKey(spgId),
    queryFn: () => fetchControllableUnitsInSpg(spgId),
    enabled: !!spgId,
  });

export const useControllableUnitsNotInSpg = (spgId: number) =>
  useQuery({
    queryKey: controllableUnitsNotInSpgQueryKey(spgId),
    queryFn: () => fetchControllableUnitsNotInSpg(spgId),
  });

export const useRemoveMembership = (spgId: number) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (membershipId: number) =>
      deleteServiceProvidingGroupMembership({
        path: { id: membershipId },
      }).then(throwOnError),
    onSettled: () => {
      queryClient.invalidateQueries({
        queryKey: controllableUnitsInSpgQueryKey(spgId),
      });
      queryClient.invalidateQueries({
        queryKey: controllableUnitsNotInSpgQueryKey(spgId),
      });
    },
  });
};

export const useAddMemberships = (spgId: number) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (cuIds: number[]) =>
      createServiceProvidingGroupMembership({
        body: cuIds.map((controllable_unit_id) => ({
          controllable_unit_id,
          service_providing_group_id: spgId,
          valid_from: set(new Date(), {
            hours: 0,
            minutes: 0,
            seconds: 0,
            milliseconds: 0,
          }).toISOString(),
        })),
      }).then(throwOnError),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: controllableUnitsInSpgQueryKey(spgId),
      });
      queryClient.invalidateQueries({
        queryKey: controllableUnitsNotInSpgQueryKey(spgId),
      });
    },
  });
};

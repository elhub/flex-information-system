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
  if (record && record.valid_to && record.valid_to < now) {
    return undefined;
  }
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
    accounting_point_business_id: accountingPoint.business_id,
    bidding_zone: currentBiddingZone?.bidding_zone,
    technical_resource_count: technicalResources.length,
  };
};

const fetchControllableUnitsInSpg = async (spgId: number) => {
  const memberships = await listServiceProvidingGroupMembership({
    query: { service_providing_group_id: "eq." + spgId },
  }).then(throwOnError);

  if (memberships.length === 0) {
    return [];
  }

  const membershipsById = new Map(
    memberships.map((m) => [m.controllable_unit_id, m.id]),
  );

  const controllableUnits = await listControllableUnit({
    query: {
      id: `in.(${memberships.map((m) => m.controllable_unit_id).join(",")})`,
    },
  }).then(throwOnError);

  return Promise.all(
    controllableUnits.map((cu) =>
      enrichControllableUnit(cu, membershipsById.get(cu.id)),
    ),
  );
};

const fetchControllableUnitsNotInSpg = async (spgId: number) => {
  const memberships = await listServiceProvidingGroupMembership({
    query: { service_providing_group_id: "eq." + spgId },
  }).then(throwOnError);

  const memberCuIds = memberships.map((m) => m.controllable_unit_id);

  const query =
    memberCuIds.length > 0 ? { id: `not.in.(${memberCuIds.join(",")})` } : {};

  const controllableUnits = await listControllableUnit({
    query,
  }).then(throwOnError);

  return Promise.all(
    controllableUnits.map((cu) => enrichControllableUnit(cu, undefined)),
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
    enabled: !!spgId,
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
    mutationFn: async ({
      cuIds,
      validFrom,
    }: {
      cuIds: number[];
      validFrom: string;
    }) => {
      const results = await Promise.allSettled(
        cuIds.map((controllable_unit_id) =>
          createServiceProvidingGroupMembership({
            body: {
              controllable_unit_id,
              service_providing_group_id: spgId,
              valid_from: validFrom,
            },
          }).then(throwOnError),
        ),
      );

      return {
        succeeded: cuIds.filter((_, i) => results[i].status === "fulfilled"),
        failed: cuIds.filter((_, i) => results[i].status === "rejected"),
      };
    },
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

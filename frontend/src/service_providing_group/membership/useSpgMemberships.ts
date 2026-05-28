import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  ControllableUnit,
  createServiceProvidingGroupMembership,
  deleteServiceProvidingGroupMembership,
  listControllableUnit,
  listServiceProvidingGroupMembership,
} from "../../generated-client";
import { findCurrentlyValidRecord, throwOnError } from "../../util";

const CONTROLLABLE_UNIT_EMBED =
  "accounting_point(bidding_zone,balance_responsible_party(balance_responsible_party)),summary";

const mapEmbeddedControllableUnit = (
  cu: ControllableUnit,
  membershipId: number | undefined,
) => {
  const brp = findCurrentlyValidRecord(
    cu.accounting_point?.balance_responsible_party ?? [],
  );
  const biddingZone = findCurrentlyValidRecord(
    cu.accounting_point?.bidding_zone ?? [],
  );

  return {
    ...cu,
    membershipId,
    accounting_point_id: cu.accounting_point?.id,
    accounting_point_business_id: cu.accounting_point?.business_id,
    bidding_zone: biddingZone?.bidding_zone,
    brp_name: brp?.balance_responsible_party?.name,
    technical_resource_count: cu.summary?.technical_resource?.count ?? 0,
    rated_power:
      cu.summary?.technical_resource?.maximum_active_power?.sum ?? undefined,
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
      embed: CONTROLLABLE_UNIT_EMBED,
    },
  }).then(throwOnError);

  return controllableUnits.map((cu) =>
    mapEmbeddedControllableUnit(cu, membershipsById.get(cu.id)),
  );
};

export const controllableUnitsInSpgQueryKey = (spgId: number) => [
  "controllableUnitsInSpg",
  spgId,
];

export const useControllableUnitsInSpg = (spgId: number) =>
  useQuery({
    queryKey: controllableUnitsInSpgQueryKey(spgId),
    queryFn: () => fetchControllableUnitsInSpg(spgId),
    enabled: !!spgId,
  });

const fetchAllControllableUnitsWithMembership = async (spgId: number) => {
  const [memberships, allCUs] = await Promise.all([
    listServiceProvidingGroupMembership({
      query: { service_providing_group_id: "eq." + spgId },
    }).then(throwOnError),
    listControllableUnit({
      query: { embed: CONTROLLABLE_UNIT_EMBED },
    }).then(throwOnError),
  ]);

  const membershipIdByCuId = new Map(
    memberships.map((m) => [m.controllable_unit_id, m.id]),
  );

  return allCUs.map((cu) =>
    mapEmbeddedControllableUnit(cu, membershipIdByCuId.get(cu.id)),
  );
};

export const allControllableUnitsWithMembershipQueryKey = (spgId: number) => [
  "allControllableUnitsWithMembership",
  spgId,
];

export const useAllControllableUnitsWithMembership = (spgId: number) =>
  useQuery({
    queryKey: allControllableUnitsWithMembershipQueryKey(spgId),
    queryFn: () => fetchAllControllableUnitsWithMembership(spgId),
    enabled: !!spgId,
  });

export type CuWithMembership = NonNullable<
  ReturnType<typeof useAllControllableUnitsWithMembership>["data"]
>[number];

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
        queryKey: allControllableUnitsWithMembershipQueryKey(spgId),
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
        failed: cuIds
          .map((cuId, i) => ({ cuId, result: results[i] }))
          .filter(({ result }) => result.status === "rejected")
          .map(({ cuId, result }) => ({
            cuId,
            error: (result as PromiseRejectedResult).reason,
          })),
      };
    },
    onSettled: () => {
      queryClient.invalidateQueries({
        queryKey: controllableUnitsInSpgQueryKey(spgId),
      });
      queryClient.invalidateQueries({
        queryKey: allControllableUnitsWithMembershipQueryKey(spgId),
      });
    },
  });
};

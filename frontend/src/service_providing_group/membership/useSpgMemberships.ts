import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  createServiceProvidingGroupMembership,
  deleteServiceProvidingGroupMembership,
  listControllableUnit,
  listServiceProvidingGroupMembership,
} from "../../generated-client";
import { throwOnError } from "../../util";
import { set } from "date-fns";

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
    queryFn: async () => {
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

      return controllableUnits.map((cu) => ({
        ...cu,
        membershipId: membershipsById[cu.id],
      }));
    },
    enabled: !!spgId,
  });

export const useControllableUnitsNotInSpg = (spgId: number) =>
  useQuery({
    queryKey: controllableUnitsNotInSpgQueryKey(spgId),
    queryFn: async () => {
      const memberships = await listServiceProvidingGroupMembership({
        query: { service_providing_group_id: "eq." + spgId },
      }).then(throwOnError);

      const membershipsById = Object.fromEntries(
        memberships.map((m) => [m.controllable_unit_id, m.id]),
      );

      const controllableUnits = await listControllableUnit({
        query: { id: `not.in.(${Object.keys(membershipsById).join(",")})` },
      }).then(throwOnError);

      return controllableUnits.map((cu) => ({
        ...cu,
        membershipId: membershipsById[cu.id],
      }));
    },
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

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  deleteServiceProvidingGroupMembership,
  readServiceProvidingGroup,
} from "../../generated-client";
import { allControllableUnitsWithMembershipQueryKey } from "../membership/useSpgMemberships";
import { throwOnError } from "../../util";
import { spgMemberControllableUnitsQueryKey } from "../shared/useSpgMemberControllableUnits";

const serviceProvidingGroupQueryKey = (spgId: number | undefined) => [
  "service_providing_group",
  spgId,
  "summary",
];
export const useServiceProvidingGroup = (spgId: number | undefined) =>
  useQuery({
    queryKey: serviceProvidingGroupQueryKey(spgId),
    queryFn: () =>
      readServiceProvidingGroup({
        path: { id: spgId ?? 0 },
        query: { embed: "summary" },
      }).then(throwOnError),
    enabled: !!spgId,
  });

export const useRemoveMembershipFromShow = (spgId: number) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (membershipId: number) =>
      deleteServiceProvidingGroupMembership({
        path: { id: membershipId },
      }).then(throwOnError),
    onSettled: () => {
      queryClient.invalidateQueries({
        queryKey: spgMemberControllableUnitsQueryKey(spgId),
      });
      queryClient.invalidateQueries({
        queryKey: allControllableUnitsWithMembershipQueryKey(spgId),
      });
    },
  });
};

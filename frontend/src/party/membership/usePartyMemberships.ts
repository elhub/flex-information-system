import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  deletePartyMembership,
  listPartyMembership,
} from "../../generated-client";
import { throwOnError } from "../../util";

export const partyMembershipsQueryKey = (partyId: number | undefined) => [
  "party_membership",
  { party_id: partyId },
];

export const usePartyMemberships = (partyId: number | undefined) =>
  useQuery({
    queryKey: partyMembershipsQueryKey(partyId),
    queryFn: () =>
      listPartyMembership({
        query: {
          party_id: `eq.${partyId}`,
          embed: "entity",
          order: "id.desc",
        },
      }).then(throwOnError),
    enabled: !!partyId,
  });

export type PartyMembershipRow = NonNullable<
  ReturnType<typeof usePartyMemberships>["data"]
>[number];

export const useRemovePartyMembership = (partyId: number) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (membershipId: number) =>
      deletePartyMembership({ path: { id: membershipId } }).then(throwOnError),
    onSettled: () => {
      queryClient.invalidateQueries({
        queryKey: partyMembershipsQueryKey(partyId),
      });
    },
  });
};

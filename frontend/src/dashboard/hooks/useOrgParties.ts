import { useQuery } from "@tanstack/react-query";
import { readParty } from "../../generated-client";
import { throwOnError } from "../../util";

export const useOrgParties = (partyID: number) => {
  return useQuery({
    queryKey: ["org-parties", { party_id: partyID }],
    queryFn: () =>
      readParty({
        path: { id: partyID },
        query: {
          embed: "entity(party)",
        },
      }).then(throwOnError),
  });
};

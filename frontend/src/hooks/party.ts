import { useQuery } from "@tanstack/react-query";
import { readParty } from "../generated-client";
import { throwOnError } from "../util";

export const useParty = (partyId: number | undefined) =>
  useQuery({
    queryKey: ["party", partyId],
    queryFn: () => readParty({ path: { id: partyId! } }).then(throwOnError),
    enabled: !!partyId,
  });

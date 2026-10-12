import { useQuery } from "@tanstack/react-query";
import { listParty } from "../generated-client";
import { throwOnError } from "../util";
import type { ListFilterOption } from "../components/list/types";

// Parties of a type as options for a select filter.
export const usePartyOptions = (type: string) =>
  useQuery({
    queryKey: ["party", "options", type],
    queryFn: () =>
      listParty({
        query: {
          type: `eq.${type}`,
          select: "id,name",
          order: "name.asc",
          limit: "1000",
        } as NonNullable<Parameters<typeof listParty>[0]>["query"],
      }).then(throwOnError),
    staleTime: 5 * 60 * 1000,
    select: (parties): ListFilterOption[] =>
      parties.map((p) => ({ value: String(p.id), label: p.name })),
  });

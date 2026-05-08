import { useGetIdentity } from "ra-core";
import { useQuery } from "@tanstack/react-query";
import { listControllableUnitServiceProvider } from "../../generated-client";
import { getCountAndData } from "../../util";
import { formatISO } from "date-fns";

export const useControllableUnits = () => {
  const { data: identity } = useGetIdentity();
  const partyID = identity?.partyID as number | undefined;

  return useQuery({
    queryKey: [
      "controllable-units",
      { service_provider_id: partyID },
    ],
    enabled: partyID != null,
    queryFn: () =>
      listControllableUnitServiceProvider({
        query: {
          service_provider_id: `eq.${partyID}`,
          valid_at: formatISO(new Date()),
          embed: "controllable_unit",
        },
        headers: {
          "Prefer": "count=exact",
        },
      }).then(getCountAndData),
  });
};

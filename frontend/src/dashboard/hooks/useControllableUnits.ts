import { useGetIdentity } from "ra-core";
import { useQuery } from "@tanstack/react-query";
import { listControllableUnitServiceProvider } from "../../generated-client";
import { throwOnError } from "../../util";

export const useControllableUnits = () => {
  const { data: identity } = useGetIdentity();
  const partyID = identity?.partyID as number | undefined;

  return useQuery({
    queryKey: [
      "dashboard-controllable-units",
      { service_provider_id: partyID },
    ],
    enabled: partyID != null,
    queryFn: () =>
      listControllableUnitServiceProvider({
        query: {
          service_provider_id: `eq.${partyID}`,
          embed: "controllable_unit",
        },
      }).then(throwOnError),
  });
};

import { useGetIdentity } from "ra-core";
import { useQuery } from "@tanstack/react-query";
import { listServiceProvidingGroup } from "../../generated-client";
import { getCountAndData } from "../../util";

export const useServiceProvidingGroups = () => {
  const { data: identity } = useGetIdentity();
  const partyID = identity?.partyID as number | undefined;

  return useQuery({
    queryKey: ["service-providing-groups", { service_provider_id: partyID }],
    enabled: partyID != null,
    queryFn: () =>
      listServiceProvidingGroup({
        query: { service_provider_id: `eq.${partyID}` },
        headers: {
          Prefer: "count=exact",
        },
      }).then(getCountAndData),
  });
};

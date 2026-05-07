import { useQuery } from "@tanstack/react-query";
import { listServiceProviderProductApplication } from "../../generated-client";
import { throwOnError } from "../../util";

export const useQualifiedServiceProviderProductApplications = (
  spId: number | undefined,
) =>
  useQuery({
    queryKey: ["resolved-sppa", spId],
    queryFn: () =>
      listServiceProviderProductApplication({
        query: {
          service_provider_id: `eq.${spId}`,
          status: "eq.qualified",
          embed: "system_operator",
        },
      }).then(throwOnError),
    enabled: !!spId,
  });

import { useQuery } from "@tanstack/react-query";
import { listServiceProviderProductApplication } from "../../generated-client";
import type { ListServiceProviderProductApplicationData } from "../../generated-client";
import { throwOnError } from "../../util";



export const useSpQualifiedMarkets = (spId: number | undefined) =>
  useQuery({
    queryKey: ["sp-qualified-markets", spId],
    queryFn: () =>
      listServiceProviderProductApplication({
        query: {
          service_provider_id: `eq.${spId}`,
          status: "eq.qualified",
        },
      }).then(throwOnError),
    enabled: !!spId,
  });

import { useQuery } from "@tanstack/react-query";
import { listServiceProviderProductApplication } from "../generated-client";
import type { ListServiceProviderProductApplicationData } from "../generated-client";
import { throwOnError } from "../util";

// "Qualified markets" in the UI maps to Service Provider Product Applications
// with status=qualified. The generated query type does not include `status`
// (it is missing from the OpenAPI spec), so we extend the type here.
type SppaListQuery = NonNullable<
  ListServiceProviderProductApplicationData["query"]
> & { status: string };

export const useSpQualifiedMarkets = (spId: number | undefined) =>
  useQuery({
    queryKey: ["sp-qualified-markets", spId],
    queryFn: () =>
      listServiceProviderProductApplication({
        query: {
          service_provider_id: `eq.${spId}`,
          status: "eq.qualified",
        } as SppaListQuery,
      }).then(throwOnError),
    enabled: !!spId,
  });

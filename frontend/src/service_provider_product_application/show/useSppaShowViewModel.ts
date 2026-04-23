import { useQuery } from "@tanstack/react-query";
import { readServiceProviderProductApplication } from "../../generated-client";
import { throwOnError } from "../../util";

export const sppaQueryKey = (id: number | undefined) => [
  "service_provider_product_application",
  id,
];

export const useSppaRecord = (id: number | undefined) =>
  useQuery({
    queryKey: sppaQueryKey(id),
    queryFn: () =>
      readServiceProviderProductApplication({
        path: { id: id ?? 0 },
      }).then(throwOnError),
    enabled: !!id,
  });

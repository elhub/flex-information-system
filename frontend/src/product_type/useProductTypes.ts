import { useQuery } from "@tanstack/react-query";
import { listProductType } from "../generated-client";
import { throwOnError } from "../util";

export const PRODUCT_TYPE_QUERY_KEY = ["product_type", "all"] as const;

export function useProductTypes() {
  return useQuery({
    queryKey: PRODUCT_TYPE_QUERY_KEY,
    queryFn: () => listProductType().then(throwOnError),
    staleTime: Infinity,
    gcTime: Infinity,
  });
}

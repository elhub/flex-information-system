import { useQuery } from "@tanstack/react-query";
import { listProductType } from "../generated-client";
import { throwOnError } from "../util";

// Shared query key for the full product_type reference list.
// Used by App.tsx to prefetch into the global QueryClient cache.
export const PRODUCT_TYPE_QUERY_KEY = ["product_type", "all"] as const;

// Single source-of-truth hook for the full product type list.
// Data is prefetched at app startup; all calls share the same cache entry.
export function useProductTypes() {
  return useQuery({
    queryKey: PRODUCT_TYPE_QUERY_KEY,
    queryFn: () => listProductType().then(throwOnError),
    staleTime: Infinity,
    gcTime: Infinity,
  });
}

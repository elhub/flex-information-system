import { useQuery } from "@tanstack/react-query";
import { readServiceProvidingGroupGridPrequalification } from "../../../generated-client";
import { throwOnError } from "../../../util";

export const spgpqQueryKey = (id: number | undefined) => [
  "service_providing_group_grid_prequalification",
  id,
];

export const useSpgpqRecord = (id: number | undefined) =>
  useQuery({
    queryKey: spgpqQueryKey(id),
    queryFn: () =>
      readServiceProvidingGroupGridPrequalification({
        path: { id: id ?? 0 },
      }).then(throwOnError),
    enabled: !!id,
  });

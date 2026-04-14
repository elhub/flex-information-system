import { useQuery } from "@tanstack/react-query";
import { readServiceProvidingGroupProductApplication } from "../../../generated-client";
import { throwOnError } from "../../../util";
import { useSpgShowViewModel } from "../../show/useSpgShowViewModel";

export const spgpaQueryKey = (id: number | undefined) => [
  "service_providing_group_product_application",
  id,
];

export const useSpgpaRecord = (id: number | undefined) =>
  useQuery({
    queryKey: spgpaQueryKey(id),
    queryFn: () =>
      readServiceProvidingGroupProductApplication({
        path: { id: id ?? 0 },
      }).then(throwOnError),
    enabled: !!id,
  });

export const useSpgpaSpgData = (spgId: number | undefined) => {
  const viewModel = useSpgShowViewModel(spgId);
  return { viewModel };
};

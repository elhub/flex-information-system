import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  readServiceProvidingGroupProductApplication,
  updateServiceProvidingGroupProductApplication,
  ServiceProvidingGroupProductApplication,
} from "../../../generated-client";
import { throwOnError } from "../../../util";
import {
  useSpgShowViewModel,
  useServiceProvidingGroup,
} from "../../show/useSpgShowViewModel";

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
  const spg = useServiceProvidingGroup(spgId);
  const viewModel = useSpgShowViewModel(spgId);
  return { spg, viewModel };
};

export const useUpdateSpgpaStatus = (id: number, spgId: number) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (status: ServiceProvidingGroupProductApplication["status"]) =>
      updateServiceProvidingGroupProductApplication({
        path: { id },
        body: { status },
      }).then(throwOnError),
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: spgpaQueryKey(id) });
      queryClient.invalidateQueries({
        queryKey: ["service_providing_group", spgId],
      });
    },
  });
};

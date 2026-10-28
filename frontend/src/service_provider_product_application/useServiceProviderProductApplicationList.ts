import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { listServiceProviderProductApplication } from "../generated-client";
import type { ServiceProviderProductApplication } from "../generated-client";
import { getCountAndData } from "../util";
import { buildListQuery } from "../components/list/postgrest";
import { useListState } from "../components/list/useListState";
import type { ListInterface } from "../components/list/types";

type Query = NonNullable<
  Parameters<typeof listServiceProviderProductApplication>[0]
>["query"];

export const useServiceProviderProductApplicationList = () => {
  const state = useListState({
    defaultSort: { field: "id", order: "desc" },
  });
  const { filters, sort, page, perPage } = state;

  const query = useQuery({
    queryKey: [
      "service_provider_product_application",
      "list",
      { filters, sort, page, perPage },
    ],
    queryFn: () =>
      listServiceProviderProductApplication({
        query: {
          ...buildListQuery({ filters, sort, page, perPage }),
          embed: "service_provider,system_operator",
        } as Query,
        headers: { Prefer: "count=exact" },
      }).then(getCountAndData),
    placeholderData: keepPreviousData,
  });

  const list: ListInterface<ServiceProviderProductApplication> = {
    ...state,
    rows: query.data?.data ?? [],
    total: query.data?.count ?? 0,
    isLoading: query.isLoading,
    isError: query.isError,
  };

  return { list };
};

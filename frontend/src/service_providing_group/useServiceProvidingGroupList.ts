import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { listServiceProvidingGroup } from "../generated-client";
import type { ServiceProvidingGroup } from "../generated-client";
import { getCountAndData } from "../util";
import { buildListQuery } from "../components/list/postgrest";
import { useListState } from "../components/list/useListState";
import type { ListInterface } from "../components/list/types";

type Query = NonNullable<
  Parameters<typeof listServiceProvidingGroup>[0]
>["query"];

export const useServiceProvidingGroupList = () => {
  const state = useListState({
    defaultSort: { field: "id", order: "desc" },
  });
  const { filters, sort, page, perPage } = state;

  const query = useQuery({
    queryKey: [
      "service_providing_group",
      "list",
      { filters, sort, page, perPage },
    ],
    queryFn: () =>
      listServiceProvidingGroup({
        query: {
          ...buildListQuery({ filters, sort, page, perPage }),
          embed: "service_provider",
        } as Query,
        headers: { Prefer: "count=exact" },
      }).then(getCountAndData),
    placeholderData: keepPreviousData,
  });

  const list: ListInterface<ServiceProvidingGroup> = {
    ...state,
    rows: query.data?.data ?? [],
    total: query.data?.count ?? 0,
    isLoading: query.isLoading,
    isError: query.isError,
  };

  return { list };
};

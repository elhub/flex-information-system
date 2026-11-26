import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { listEvent } from "../generated-client";
import type { Event } from "../generated-client";
import { getCountAndData } from "../util";
import { buildListQuery } from "../components/list/postgrest";
import { useListState } from "../components/list/useListState";
import type { ListInterface } from "../components/list/types";

type Query = NonNullable<Parameters<typeof listEvent>[0]>["query"];

export const useEventList = () => {
  const state = useListState({
    defaultSort: { field: "id", order: "desc" },
  });
  const { filters, sort, page, perPage } = state;

  const query = useQuery({
    queryKey: ["event", "list", { filters, sort, page, perPage }],
    queryFn: () =>
      listEvent({
        query: buildListQuery({ filters, sort, page, perPage }) as Query,
        headers: { Prefer: "count=exact" },
      }).then(getCountAndData),
    placeholderData: keepPreviousData,
  });

  const list: ListInterface<Event> = {
    ...state,
    rows: query.data?.data ?? [],
    total: query.data?.count ?? 0,
    isLoading: query.isLoading,
    isError: query.isError,
  };

  return { list };
};

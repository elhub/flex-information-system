import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { listServiceProvidingGroupProductApplication } from "../../generated-client";
import type { ServiceProvidingGroupProductApplication } from "../../generated-client";
import { getCountAndData } from "../../util";
import { buildListQuery } from "../../components/list/postgrest";
import { useListState } from "../../components/list/useListState";
import type { ListInterface } from "../../components/list/types";

type Query = NonNullable<
  Parameters<typeof listServiceProvidingGroupProductApplication>[0]
>["query"];

// Always inner-join the service providing group so filters on it (name,
// service provider) drop applications that do not match.
const EMBED =
  "service_providing_group!(service_provider,summary),procuring_system_operator";

export const useServiceProvidingGroupProductApplicationList = () => {
  const state = useListState({
    defaultSort: { field: "id", order: "desc" },
  });
  const { filters, sort, page, perPage } = state;

  const query = useQuery({
    queryKey: [
      "service_providing_group_product_application",
      "list",
      { filters, sort, page, perPage },
    ],
    queryFn: () =>
      listServiceProvidingGroupProductApplication({
        query: {
          ...buildListQuery({ filters, sort, page, perPage }),
          embed: EMBED,
        } as Query,
        headers: { Prefer: "count=exact" },
      }).then(getCountAndData),
    placeholderData: keepPreviousData,
  });

  const list: ListInterface<ServiceProvidingGroupProductApplication> = {
    ...state,
    rows: query.data?.data ?? [],
    total: query.data?.count ?? 0,
    isLoading: query.isLoading,
    isError: query.isError,
  };

  return { list };
};

import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { listServiceProvidingGroupGridPrequalification } from "../../generated-client";
import type { ServiceProvidingGroupGridPrequalification } from "../../generated-client";
import { getCountAndData } from "../../util";
import { buildListQuery } from "../../components/list/postgrest";
import { useListState } from "../../components/list/useListState";
import type { ListFilters, ListInterface } from "../../components/list/types";

export const SPG_NAME_FILTER_SOURCE = "service_providing_group.name@ilike";

type Query = NonNullable<
  Parameters<typeof listServiceProvidingGroupGridPrequalification>[0]
>["query"];

// Inner-join the service providing group only when filtering on it, so rows
// without a matching group are dropped instead of having an empty embed.
export const buildEmbed = (filters: ListFilters) =>
  `service_providing_group${filters[SPG_NAME_FILTER_SOURCE] ? "!" : ""},impacted_system_operator`;

export const useServiceProvidingGroupGridPrequalificationList = () => {
  const state = useListState({
    defaultSort: { field: "id", order: "desc" },
  });
  const { filters, sort, page, perPage } = state;

  const query = useQuery({
    queryKey: [
      "service_providing_group_grid_prequalification",
      "list",
      { filters, sort, page, perPage },
    ],
    queryFn: () =>
      listServiceProvidingGroupGridPrequalification({
        query: {
          ...buildListQuery({ filters, sort, page, perPage }),
          // `and` so it does not clash with the user's status filter
          and: "(status.neq.inactive)",
          embed: buildEmbed(filters),
        } as Query,
        headers: { Prefer: "count=exact" },
      }).then(getCountAndData),
    placeholderData: keepPreviousData,
  });

  const list: ListInterface<ServiceProvidingGroupGridPrequalification> = {
    ...state,
    rows: query.data?.data ?? [],
    total: query.data?.count ?? 0,
    isLoading: query.isLoading,
    isError: query.isError,
  };

  return { list };
};

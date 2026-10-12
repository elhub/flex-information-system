import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { listControllableUnit } from "../generated-client";
import type { ControllableUnit } from "../generated-client";
import { getCountAndData } from "../util";
import { buildListQuery } from "../components/list/postgrest";
import { useListState } from "../components/list/useListState";
import type { ListFilters, ListInterface } from "../components/list/types";

// Filter source for "current balance responsible party". The BRP is embedded
// through the accounting point, and is time-ranged.
export const BRP_FILTER_SOURCE =
  "accounting_point.balance_responsible_party.balance_responsible_party_id@in";
const BRP_VALID_AT_KEY = "accounting_point.balance_responsible_party.valid_at";

// Inner join the BRP embed when filtering on it, so units without a matching
// BRP are dropped instead of just having an empty embed.
const buildEmbed = (filters: ListFilters, full: boolean) => {
  const brp = filters[BRP_FILTER_SOURCE]
    ? "balance_responsible_party!"
    : "balance_responsible_party";
  if (!full) {
    return filters[BRP_FILTER_SOURCE]
      ? `accounting_point!(${brp})`
      : "accounting_point";
  }
  return `accounting_point!(bidding_zone, system_operator, ${brp}(balance_responsible_party))`;
};

// Restrict the embedded BRP to the one valid now, which is the one shown in the table.
const withCurrentBrp = (query: Record<string, string>, filters: ListFilters) =>
  filters[BRP_FILTER_SOURCE]
    ? { ...query, [BRP_VALID_AT_KEY]: new Date().toISOString() }
    : query;

// The backend checks permissions per row, so we narrow down by default.
const DEFAULT_FILTERS: ListFilters = { "status@in": "active" };

type Query = NonNullable<Parameters<typeof listControllableUnit>[0]>["query"];

const fetchControllableUnits = (query: Record<string, string>, embed: string) =>
  listControllableUnit({
    query: { ...query, embed } as Query,
    headers: { Prefer: "count=exact" },
  }).then(getCountAndData);

export const useControllableUnitList = () => {
  const state = useListState({
    defaultFilters: DEFAULT_FILTERS,
    defaultSort: { field: "id", order: "desc" },
  });
  const { filters, sort, page, perPage } = state;

  const query = useQuery({
    queryKey: ["controllable_unit", "list", { filters, sort, page, perPage }],
    queryFn: () =>
      fetchControllableUnits(
        withCurrentBrp(
          buildListQuery({ filters, sort, page, perPage }),
          filters,
        ),
        buildEmbed(filters, true),
      ),
    placeholderData: keepPreviousData,
  });

  const list: ListInterface<ControllableUnit> = {
    ...state,
    rows: query.data?.data ?? [],
    total: query.data?.count ?? 0,
    isLoading: query.isLoading,
    isError: query.isError,
  };

  // export everything matching the current filters and sort, not just one page
  const fetchAllForExport = async () => {
    const { data } = await fetchControllableUnits(
      withCurrentBrp(
        buildListQuery({ filters, sort, page: 1, perPage: 100000 }),
        filters,
      ),
      buildEmbed(filters, false),
    );
    return data;
  };

  return { list, fetchAllForExport };
};

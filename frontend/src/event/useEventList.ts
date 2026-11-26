import { useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { listEvent } from "../generated-client";
import type { Event } from "../generated-client";
import { getCountAndData } from "../util";
import { buildListQuery } from "../components/list/postgrest";
import { useListState } from "../components/list/useListState";
import type {
  ListFilters,
  ListInterface,
  ListSort,
} from "../components/list/types";

type Query = NonNullable<Parameters<typeof listEvent>[0]>["query"];

export type EventQueryParams = {
  filters: ListFilters;
  sort: ListSort;
  page: number;
  perPage: number;
};

export const fetchEvents = ({
  filters,
  sort,
  page,
  perPage,
}: EventQueryParams) =>
  listEvent({
    query: buildListQuery({ filters, sort, page, perPage }) as Query,
    headers: { Prefer: "count=exact" },
  }).then(getCountAndData);

const LEGACY_FILTER_PARAM = "filter";

// Other pages link to the event list with the react-admin URL format,
// `?filter={"source@eq":"/party/1"}`. Translate it to the useListState format
// (`?filtered=1&f.source@eq=/party/1`). Returns null when there is nothing to
// translate.
export const fromLegacyFilterParam = (
  params: URLSearchParams,
): URLSearchParams | null => {
  const legacy = params.get(LEGACY_FILTER_PARAM);
  if (legacy === null) return null;

  const next = new URLSearchParams(params);
  next.delete(LEGACY_FILTER_PARAM);

  let parsed: unknown;
  try {
    parsed = JSON.parse(legacy);
  } catch {
    return next;
  }
  if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
    return next;
  }

  const entries = Object.entries(parsed).filter(
    ([, value]) => typeof value === "string" && value !== "",
  ) as [string, string][];
  if (entries.length === 0) return next;

  [...next.keys()]
    .filter((key) => key.startsWith("f."))
    .forEach((key) => next.delete(key));
  entries.forEach(([source, value]) => next.set(`f.${source}`, value));
  next.set("filtered", "1");
  next.delete("page");
  return next;
};

export const useEventList = () => {
  const [params, setParams] = useSearchParams();
  const hasLegacyFilter = params.has(LEGACY_FILTER_PARAM);

  useEffect(() => {
    if (!hasLegacyFilter) return;
    setParams((prev) => fromLegacyFilterParam(prev) ?? prev, { replace: true });
  }, [hasLegacyFilter, setParams]);

  const state = useListState({
    defaultSort: { field: "id", order: "desc" },
  });
  const { filters, sort, page, perPage } = state;

  const query = useQuery({
    queryKey: ["event", "list", { filters, sort, page, perPage }],
    queryFn: () => fetchEvents({ filters, sort, page, perPage }),
    placeholderData: keepPreviousData,
    // wait until a legacy filter link is translated, to not fetch unfiltered
    enabled: !hasLegacyFilter,
  });

  const list: ListInterface<Event> = {
    ...state,
    rows: query.data?.data ?? [],
    total: query.data?.count ?? 0,
    isLoading: hasLegacyFilter || query.isLoading,
    isError: query.isError,
  };

  return { list };
};

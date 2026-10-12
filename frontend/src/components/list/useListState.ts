import { useSearchParams } from "react-router-dom";
import type { ListFilters, ListSort } from "./types";

const FILTER_PREFIX = "f.";

type Options = {
  defaultFilters?: ListFilters;
  defaultSort: ListSort;
  defaultPerPage?: number;
};

// Filter, sort and paging state kept in the URL search params, so list
// pages are linkable and survive navigation back from a show page.
// Default filters apply until the user touches any filter ("filtered=1").
export const useListState = ({
  defaultFilters = {},
  defaultSort,
  defaultPerPage = 25,
}: Options) => {
  const [params, setParams] = useSearchParams();

  const isFiltered = params.get("filtered") === "1";
  const filters: ListFilters = {};
  if (isFiltered) {
    params.forEach((value, key) => {
      if (key.startsWith(FILTER_PREFIX)) {
        filters[key.slice(FILTER_PREFIX.length)] = value;
      }
    });
  } else {
    Object.assign(filters, defaultFilters);
  }

  const sortParam = params.get("sort");
  const [sortField, sortOrder] = sortParam?.split(".") ?? [];
  const sort: ListSort =
    sortField && (sortOrder === "asc" || sortOrder === "desc")
      ? { field: sortField, order: sortOrder }
      : defaultSort;

  const page = Number(params.get("page") ?? 1);
  const perPage = Number(params.get("perPage") ?? defaultPerPage);

  const update = (fn: (next: URLSearchParams) => void) =>
    setParams(
      (prev) => {
        const next = new URLSearchParams(prev);
        fn(next);
        return next;
      },
      { replace: true },
    );

  // write the effective filters to the URL so edits start from what is shown
  const writeFilters = (next: URLSearchParams, values: ListFilters) => {
    [...next.keys()]
      .filter((k) => k.startsWith(FILTER_PREFIX))
      .forEach((k) => next.delete(k));
    Object.entries(values).forEach(([k, v]) => next.set(FILTER_PREFIX + k, v));
    next.set("filtered", "1");
    next.delete("page");
  };

  return {
    filters,
    sort,
    page,
    perPage,
    hasDefaultFilters: Object.keys(defaultFilters).length > 0,
    setFilter: (source: string, value: string | undefined) =>
      update((next) => {
        const values = { ...filters };
        if (value) values[source] = value;
        else delete values[source];
        writeFilters(next, values);
      }),
    clearFilters: () => update((next) => writeFilters(next, {})),
    resetFilters: () =>
      update((next) => {
        [...next.keys()]
          .filter((k) => k.startsWith(FILTER_PREFIX))
          .forEach((k) => next.delete(k));
        next.delete("filtered");
        next.delete("page");
      }),
    resetSort: () =>
      update((next) => {
        next.delete("sort");
        next.delete("page");
      }),
    setSort: (value: ListSort) =>
      update((next) => {
        next.set("sort", `${value.field}.${value.order}`);
        next.delete("page");
      }),
    setPage: (value: number) =>
      update((next) => next.set("page", String(value))),
    setPerPage: (value: number) =>
      update((next) => {
        next.set("perPage", String(value));
        next.delete("page");
      }),
  };
};

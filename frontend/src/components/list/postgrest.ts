import type { ListFilters, ListSort } from "./types";

type ListParams = {
  filters: ListFilters;
  sort: ListSort;
  page: number;
  perPage: number;
};

// Translate a filter "source@op" and raw value to a PostgREST query entry.
const toFilterEntry = (
  source: string,
  value: string,
): [string, string] | undefined => {
  const [column, op = "eq"] = source.split("@");
  if (value === "") return undefined;
  switch (op) {
    case "ilike":
      return [column, `ilike.*${value}*`];
    case "in":
      return [column, `in.(${value})`];
    default:
      return [column, `${op}.${value}`];
  }
};

// Build the query params for a PostgREST list request (filters, order, paging).
export const buildListQuery = ({
  filters,
  sort,
  page,
  perPage,
}: ListParams): Record<string, string> => {
  const query: Record<string, string> = {};
  for (const [source, value] of Object.entries(filters)) {
    const entry = toFilterEntry(source, value);
    if (entry) query[entry[0]] = entry[1];
  }
  query.order = `${sort.field}.${sort.order}`;
  query.limit = String(perPage);
  query.offset = String((page - 1) * perPage);
  return query;
};

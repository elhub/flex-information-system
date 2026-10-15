// Contract between a list page hook and ResourceListLayout.
// The layout only knows this interface, not where the data comes from.

export type ListSort = {
  field: string;
  order: "asc" | "desc";
};

// Filter state, keyed by source like "name@ilike" or "status@in".
// Values are the raw user input; array values are comma-separated.
export type ListFilters = Record<string, string>;

export type ListInterface<T> = {
  rows: T[];
  total: number;
  isLoading: boolean;
  isError: boolean;

  filters: ListFilters;
  // empty/undefined value removes the filter
  setFilter: (source: string, value: string | undefined) => void;
  // remove all filters, including the defaults
  clearFilters: () => void;
  // go back to the page's default filters
  resetFilters: () => void;
  // true when the page has default filters and the current ones differ
  canResetFilters: boolean;

  sort: ListSort;
  setSort: (sort: ListSort) => void;
  // back to the page's default sort
  resetSort: () => void;

  page: number;
  setPage: (page: number) => void;
  perPage: number;
  setPerPage: (perPage: number) => void;
};

export type ListColumn<T> = {
  header: string;
  render: (row: T) => React.ReactNode;
  // set to make the header sortable; the value is the backend field
  sortField?: string;
  sortType?: "string" | "date" | "number";
};

export type ListFilterOption = { value: string; label: string };

type FilterBase = {
  source: string;
  label: string;
  tooltip?: string;
};

export type ListFilterDef =
  | (FilterBase & { type: "text" })
  | (FilterBase & {
      type: "singleselect";
      options: ListFilterOption[];
    })
  | (FilterBase & {
      type: "multiselect";
      options: ListFilterOption[];
      isLoading?: boolean;
    });

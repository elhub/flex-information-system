import { ReactNode } from "react";
import { Heading, Panel } from "../ui";
import { ListFilters } from "./ListFilters";
import { ListPagination } from "./ListPagination";
import { ListTable } from "./ListTable";
import type { ListColumn, ListFilterDef, ListInterface } from "./types";

type ListPageLayoutProps<T extends { id: number | string }> = {
  title: string;
  list: ListInterface<T>;
  columns: ListColumn<T>[];
  filters?: ListFilterDef[];
  actions?: ReactNode;
  // where to navigate when a row is clicked; omit for non-clickable rows
  rowLink?: (row: T) => string;
};

// Common layout for list pages: heading, actions, filter bar, sortable table
// and paging. Data and business logic live in a per-resource hook returning
// ListInterface; each part below only depends on that interface.
export const ListPageLayout = <T extends { id: number | string }>({
  title,
  list,
  columns,
  filters = [],
  actions,
  rowLink,
}: ListPageLayoutProps<T>) => (
  <div className="flex flex-col gap-2">
    <div className="flex items-center justify-between gap-2 mb-4">
      <Heading level={2} size="xlarge">
        {title}
      </Heading>
      {actions && <div className="flex gap-2">{actions}</div>}
    </div>
    <Panel border className="flex flex-col gap-5">
      <ListFilters filters={filters} list={list} />
      <ListTable list={list} columns={columns} rowLink={rowLink} />
      <ListPagination list={list} />
    </Panel>
  </div>
);

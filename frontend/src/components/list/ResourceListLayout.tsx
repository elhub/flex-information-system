import { ReactNode } from "react";
import { Heading, Panel } from "../ui";
import { ListFilters } from "./ListFilters";
import { ListPagination } from "./ListPagination";
import { ListTable, type ListTableProps } from "./ListTable";
import type { ListFilterDef } from "./types";

type ResourceListLayoutProps<T extends { id: number | string }> = {
  title: string;
  filters?: ListFilterDef[];
  actions?: ReactNode;
} & ListTableProps<T>;

// Common layout for list pages: heading, actions, filter bar, sortable table
// and paging. Data and business logic live in a per-resource hook returning
// ListInterface; each part below only depends on that interface.
export const ResourceListLayout = <T extends { id: number | string }>({
  title,
  list,
  columns,
  filters = [],
  actions,
  rowLink,
  expandedContent,
  rowActions,
}: ResourceListLayoutProps<T>) => (
  <div className="flex flex-col gap-2">
    <div className="flex items-center justify-between gap-2 mb-4">
      <Heading level={2} size="large">
        {title}
      </Heading>
      {actions && <div className="flex gap-2">{actions}</div>}
    </div>
    <Panel border className="flex flex-col gap-5">
      <ListFilters filters={filters} list={list} />
      <ListTable
        list={list}
        columns={columns}
        rowLink={rowLink}
        expandedContent={expandedContent}
        rowActions={rowActions}
      />
      <ListPagination list={list} />
    </Panel>
  </div>
);

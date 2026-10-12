import { ReactNode, useEffect, useState } from "react";
import { IconInformationCircleOutlined } from "@elhub/ds-icons";
import { useNavigate } from "react-router-dom";
import {
  Alert,
  BodyText,
  Button,
  Combobox,
  FormItem,
  FormItemLabel,
  Heading,
  Loader,
  Pagination,
  Panel,
  Table,
  TextField,
  Tooltip,
  type SortState,
} from "../ui";
import type { ListColumn, ListFilterDef, ListInterface } from "./types";

const PER_PAGE_OPTIONS = ["25", "50", "75", "100"];

type ListPageLayoutProps<T extends { id: number | string }> = {
  title: string;
  list: ListInterface<T>;
  columns: ListColumn<T>[];
  filters?: ListFilterDef[];
  actions?: ReactNode;
  // where to navigate when a row is clicked; omit for non-clickable rows
  rowLink?: (row: T) => string;
};

// Common layout for list pages: actions, filter bar, sortable table and paging.
// Data and business logic live in a per-resource hook returning ListInterface.
export const ListPageLayout = <T extends { id: number | string }>({
  title,
  list,
  columns,
  filters = [],
  actions,
  rowLink,
}: ListPageLayoutProps<T>) => {
  const navigate = useNavigate();

  const sortState: SortState = {
    orderBy: list.sort.field,
    direction: list.sort.order === "asc" ? "ascending" : "descending",
  };

  const handleSortChange = (next?: SortState) => {
    // third click on a header clears the sort
    if (!next) {
      list.resetSort();
      return;
    }
    list.setSort({
      field: next.orderBy,
      order: next.direction === "ascending" ? "asc" : "desc",
    });
  };

  const handleRowClick = (e: React.MouseEvent, row: T) => {
    if (!rowLink) return;
    // links and buttons inside the row handle their own click
    if ((e.target as HTMLElement).closest("button, a")) return;
    navigate(rowLink(row));
  };

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center justify-between gap-2 mb-4">
        <Heading level={2} size="xlarge">
          {title}
        </Heading>
        {actions && <div className="flex gap-2">{actions}</div>}
      </div>
      <Panel border className="flex flex-col gap-5">
        {filters.length > 0 && (
          <div className="flex gap-2 flex-wrap items-end">
            {filters.map((def) => (
              <FilterControl key={def.source} def={def} list={list} />
            ))}
            {Object.keys(list.filters).length > 0 && (
              <Button variant="invisible" onClick={list.clearFilters}>
                Clear filters
              </Button>
            )}
            {list.hasDefaultFilters && (
              <Button variant="invisible" onClick={list.resetFilters}>
                Reset filters
              </Button>
            )}
          </div>
        )}

        {list.isError ? (
          <Alert variant="error">Could not load the list.</Alert>
        ) : list.isLoading ? (
          <Loader />
        ) : list.rows.length === 0 ? (
          <BodyText>No results</BodyText>
        ) : (
          <Table.ScrollContainer>
            <Table
              size="medium"
              fit="container"
              sort={sortState}
              onSortChange={handleSortChange}
            >
              <Table.Header>
                <Table.Row>
                  {columns.map((col) => (
                    <Table.ColumnHeader
                      key={col.header}
                      scope="col"
                      sortable={!!col.sortField}
                      sortKey={col.sortField}
                      sortType={col.sortType}
                    >
                      {col.header}
                    </Table.ColumnHeader>
                  ))}
                </Table.Row>
              </Table.Header>
              <Table.Body>
                {list.rows.map((row) => (
                  <Table.Row
                    key={row.id}
                    style={rowLink ? { cursor: "pointer" } : undefined}
                    onClick={(e) => handleRowClick(e, row)}
                  >
                    {columns.map((col) => (
                      <Table.DataCell key={col.header}>
                        {col.render(row)}
                      </Table.DataCell>
                    ))}
                  </Table.Row>
                ))}
              </Table.Body>
            </Table>
          </Table.ScrollContainer>
        )}

        <ListPagination list={list} />
      </Panel>
    </div>
  );
};

const FilterControl = <T,>({
  def,
  list,
}: {
  def: ListFilterDef;
  list: ListInterface<T>;
}) => {
  const id = `filter-${def.source}`;
  const value = list.filters[def.source] ?? "";

  return (
    <FormItem id={id} size="small" className="w-[16rem]">
      <div className="flex items-center gap-2">
        <FormItemLabel htmlFor={id} size="small">
          {def.label}
        </FormItemLabel>
        {def.tooltip && (
          <Tooltip content={def.tooltip}>
            <span>
              <IconInformationCircleOutlined />
            </span>
          </Tooltip>
        )}
      </div>
      {def.type === "text" ? (
        <DebouncedTextField
          id={id}
          value={value}
          onChange={(v) => list.setFilter(def.source, v)}
        />
      ) : def.type === "select" ? (
        <Combobox
          // remount on value change so the typed text follows clear/reset
          key={value}
          defaultValue={def.options.find((o) => o.value === value)?.label ?? ""}
          options={def.options}
          clearButton
          selectedOptions={def.options.filter((o) => o.value === value)}
          onToggleSelected={(option, isSelected) =>
            list.setFilter(def.source, isSelected ? option : undefined)
          }
          onClear={() => list.setFilter(def.source, undefined)}
        />
      ) : (
        <Combobox
          options={def.options}
          isLoading={def.isLoading}
          isMultiSelect
          selectedOptions={def.options.filter((o) =>
            value.split(",").includes(o.value),
          )}
          onToggleSelected={(option, isSelected) => {
            const current = value ? value.split(",") : [];
            const next = isSelected
              ? [...current, option]
              : current.filter((v) => v !== option);
            list.setFilter(def.source, next.join(",") || undefined);
          }}
        />
      )}
    </FormItem>
  );
};

// Avoid one backend request per keystroke.
const DebouncedTextField = ({
  id,
  value,
  onChange,
}: {
  id: string;
  value: string;
  onChange: (value: string) => void;
}) => {
  const [text, setText] = useState(value);

  // follow external changes, e.g. reset to default filters
  const [prevValue, setPrevValue] = useState(value);
  if (value !== prevValue) {
    setPrevValue(value);
    setText(value);
  }

  useEffect(() => {
    if (text === value) return;
    const timer = setTimeout(() => onChange(text), 400);
    return () => clearTimeout(timer);
  }, [text, value, onChange]);

  return (
    <TextField id={id} value={text} onChange={(e) => setText(e.target.value)} />
  );
};

const ListPagination = <T,>({ list }: { list: ListInterface<T> }) => {
  if (!list.total) return null;
  return (
    <div className="flex items-center gap-4">
      <div className="mr-auto">
        <Pagination
          count={Math.ceil(list.total / list.perPage)}
          page={list.page}
          onPageChange={list.setPage}
          prevText="Previous"
          nextText="Next"
        />
      </div>
      <div className="w-32 shrink-0">
        <FormItem size="medium">
          <Combobox
            options={PER_PAGE_OPTIONS}
            selectedOptions={[String(list.perPage)]}
            onToggleSelected={(option) => list.setPerPage(Number(option))}
          />
        </FormItem>
      </div>
    </div>
  );
};

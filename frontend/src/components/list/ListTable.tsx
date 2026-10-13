import { useNavigate } from "react-router-dom";
import { Alert, BodyText, Loader, Table, type SortState } from "../ui";
import type { ListColumn, ListInterface } from "./types";

export type ListTableProps<T extends { id: number | string }> = {
  list: ListInterface<T>;
  columns: ListColumn<T>[];
  rowLink?: (row: T) => string;
  expandedContent?: (row: T) => React.ReactNode;
};

// Sortable table for a ListInterface, including error, loading and empty states.
export const ListTable = <T extends { id: number | string }>({
  list,
  columns,
  rowLink,
  expandedContent,
}: ListTableProps<T>) => {
  if (list.isError)
    return <Alert variant="error">Could not load the list.</Alert>;
  if (list.isLoading) return <Loader />;
  if (list.rows.length === 0) return <BodyText>No results</BodyText>;

  return (
    <RowsTable
      list={list}
      columns={columns}
      rowLink={rowLink}
      expandedContent={expandedContent}
    />
  );
};

const RowsTable = <T extends { id: number | string }>({
  list,
  columns,
  rowLink,
  expandedContent,
}: ListTableProps<T>) => {
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
    <Table.ScrollContainer>
      <Table
        size="medium"
        fit="container"
        sort={sortState}
        onSortChange={handleSortChange}
      >
        <Table.Header>
          <Table.Row>
            {expandedContent && <Table.ColumnHeader style={{ width: "1px" }} />}
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
          {list.rows.map((row) => {
            const cells = columns.map((col) => (
              <Table.DataCell key={col.header}>
                {col.render(row)}
              </Table.DataCell>
            ));
            const style = rowLink ? { cursor: "pointer" } : undefined;
            return expandedContent ? (
              <Table.ExpandableRow
                key={row.id}
                style={style}
                onClick={(e) => handleRowClick(e, row)}
                content={expandedContent(row)}
              >
                {cells}
              </Table.ExpandableRow>
            ) : (
              <Table.Row
                key={row.id}
                style={style}
                onClick={(e) => handleRowClick(e, row)}
              >
                {cells}
              </Table.Row>
            );
          })}
        </Table.Body>
      </Table>
    </Table.ScrollContainer>
  );
};

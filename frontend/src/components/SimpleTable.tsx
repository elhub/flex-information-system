import { ReactNode } from "react";
import { BodyText, Table } from "./ui";

export type ColumnOf<TList extends unknown[] | undefined> = Column<
  NonNullable<TList>[number]
>;

export type Column<T> = {
  key: keyof T;
  header: ReactNode;
  render?: (value: T[keyof T], row: T) => ReactNode;
};

type SimpleTableProps<T extends { id?: unknown }> = {
  columns: Column<T>[];
  data: T[];
  size?: "medium" | "small";
  empty?: ReactNode;
  action?: { render: (row: T) => ReactNode; header?: string };
  checkbox?: { render: (row: T) => ReactNode; header?: ReactNode };
  className?: string;
  rowClick?: (record: T) => void;
};

export const SimpleTable = <T extends { id?: unknown }>({
  columns,
  data,
  size,
  empty = "No results",
  action,
  checkbox,
  className,
  rowClick,
}: SimpleTableProps<T>) => {
  const handleRowClick = (
    e: React.MouseEvent<HTMLTableRowElement>,
    record: T,
  ) => {
    if (!rowClick) return;
    const target = e.target as HTMLElement;
    // We dont want to navigate if the target is a button or a link, or a modal
    // overlay, because it's handled by the button or link itself.
    if (target.closest("button, a, .eds-modal__overlay")) {
      return;
    }

    rowClick(record);
  };

  if (!data.length) return <BodyText>{empty}</BodyText>;
  return (
    <Table className={className} size={size}>
      <Table.Header>
        <Table.Row>
          {checkbox && (
            <Table.ColumnHeader scope="col">
              {checkbox.header ?? ""}
            </Table.ColumnHeader>
          )}
          {columns.map((col) => (
            <Table.ColumnHeader key={String(col.key)} scope="col">
              {col.header}
            </Table.ColumnHeader>
          ))}
          {action && (
            <Table.ColumnHeader
              scope="col"
              aria-label={action.header ?? "Actions"}
            >
              {action.header ?? ""}
            </Table.ColumnHeader>
          )}
        </Table.Row>
      </Table.Header>
      <Table.Body>
        {data.map((row, i) => (
          <Table.Row
            key={String(row.id ?? i)}
            onClick={(e) => handleRowClick(e, row)}
          >
            {checkbox && (
              <Table.DataCell>{checkbox.render(row)}</Table.DataCell>
            )}
            {columns.map((col) => (
              <Table.DataCell key={String(col.key)}>
                {col.render
                  ? col.render(row[col.key], row)
                  : String(row[col.key] ?? "")}
              </Table.DataCell>
            ))}
            {action && <Table.DataCell>{action.render(row)}</Table.DataCell>}
          </Table.Row>
        ))}
      </Table.Body>
    </Table>
  );
};

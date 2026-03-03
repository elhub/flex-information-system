import { ReactNode } from "react";
import { BodyText, Table } from "./ui";

export type Column<T> = {
  key: keyof T;
  header: string;
  render?: (value: T[keyof T], row: T) => ReactNode;
};

type SimpleTableProps<T extends { id?: unknown }> = {
  columns: Column<T>[];
  data: T[];
  size?: "medium" | "small";
  empty?: ReactNode;
  action?: { render: (row: T) => ReactNode; header?: string };
};

export const SimpleTable = <T extends { id?: unknown }>({
  columns,
  data,
  size,
  empty = "No results",
  action,
}: SimpleTableProps<T>) => {
  if (!data.length) return <BodyText>{empty}</BodyText>;

  return (
    <Table size={size}>
      <Table.Header>
        <Table.Row>
          {columns.map((col) => (
            <Table.ColumnHeader key={String(col.key)} scope="col">
              {col.header}
            </Table.ColumnHeader>
          ))}
        </Table.Row>
      </Table.Header>
      <Table.Body>
        {data.map((row, i) => (
          <Table.Row key={String(row.id ?? i)}>
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

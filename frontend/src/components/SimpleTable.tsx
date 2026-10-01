import React, { ReactNode } from "react";
import { BodyText, Table } from "./ui";
import { Tooltip } from "../components/ui";
import { IconInformationCircleOutlined } from "@elhub/ds-icons";

export type ColumnOf<TList extends unknown[] | undefined> = Column<
  NonNullable<TList>[number]
>;

export type Column<T> = {
  key: keyof T;
  header: ReactNode;
  headerTooltip?: string;
  render?: (value: T[keyof T], row: T) => ReactNode;
};

type SimpleTableProps<T extends { id?: string | number }> = {
  columns: Column<T>[];
  data: T[];
  size?: "medium" | "small";
  empty?: ReactNode;
  action?: { render: (row: T) => ReactNode; header?: string };
  rowActions?: (row: T) => ReactNode;
  expandPanel?: (row: T) => ReactNode;
  onExpand?: (row: T, isOpen: boolean) => void;
  checkbox?: { render: (row: T) => ReactNode; header?: ReactNode };
  rowKey?: (row: T) => string | number;
  className?: string;
  rowClick?: (record: T) => void;
};

export const SimpleTable = <T extends { id?: string | number }>({
  columns,
  data,
  size,
  empty = "No results",
  action,
  rowActions,
  expandPanel,
  onExpand,
  checkbox,
  className,
  rowKey,
  rowClick,
}: SimpleTableProps<T>) => {
  const hasRowClick = rowClick !== undefined;
  const handleRowClick = (
    e: React.MouseEvent<HTMLTableRowElement>,
    record: T,
  ) => {
    if (!rowClick) return;
    const target = e.target as HTMLElement;
    // We don't want to navigate if the target is a button or a link, or a modal
    // overlay, because it's handled by the button or link itself.
    if (target.closest("button, a, .eds-modal__overlay")) {
      return;
    }

    rowClick(record);
  };

  if (!data.length)
    return typeof empty === "string" ? (
      <BodyText>{empty}</BodyText>
    ) : (
      <>{empty}</>
    );

  const hasAnyAction =
    rowActions != null && data.some((r) => rowActions(r) != null);

  return (
    <Table className={className} size={size}>
      <Table.Header>
        <Table.Row>
          {expandPanel && <Table.ColumnHeader style={{ width: "1px" }} />}
          {checkbox && (
            <Table.ColumnHeader scope="col">
              {checkbox.header ?? ""}
            </Table.ColumnHeader>
          )}
          {columns.map((col) => (
            <Table.ColumnHeader key={String(col.key)} scope="col">
              {col.headerTooltip ? (
                <div className={"flex items-center gap-1"}>
                  <BodyText size="small" weight="bold">
                    {col.header}
                  </BodyText>
                  <Tooltip content={col.headerTooltip}>
                    <span>
                      <IconInformationCircleOutlined />
                    </span>
                  </Tooltip>
                </div>
              ) : (
                <>{col.header}</>
              )}
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
          {hasAnyAction && (
            <Table.ColumnHeader style={{ width: "1px" }} aria-label="Actions" />
          )}
        </Table.Row>
      </Table.Header>
      <Table.Body>
        {data.map((row, i) =>
          expandPanel ? (
            <Table.ExpandableRow
              key={rowKey ? rowKey(row) : String(row.id ?? i)}
              style={hasRowClick ? { cursor: "pointer" } : undefined}
              content={expandPanel(row)}
              onOpenChange={(isOpen: boolean) => onExpand?.(row, isOpen)}
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
              {hasAnyAction && (
                <Table.DataCell>{rowActions!(row)}</Table.DataCell>
              )}
            </Table.ExpandableRow>
          ) : (
            <Table.Row
              key={rowKey ? rowKey(row) : String(row.id ?? i)}
              onClick={(e) => handleRowClick(e, row)}
              className={rowClick ? "cursor-pointer" : undefined}
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
              {hasAnyAction && (
                <Table.DataCell>{rowActions!(row)}</Table.DataCell>
              )}
            </Table.Row>
          ),
        )}
      </Table.Body>
    </Table>
  );
};

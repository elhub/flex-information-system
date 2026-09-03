import React, {
  Children,
  ReactNode,
  cloneElement,
  isValidElement,
} from "react";
import { humanize } from "inflection";
import { useNavigate } from "react-router-dom";
import {
  FieldTitle,
  RaRecord,
  RecordContextProvider,
  useResourceContext,
  useListContext,
} from "ra-core";
import { BodyText, Loader, Table } from "../../ui";
import { FieldTooltip } from "../fields/FieldTooltip";

type RowClickResult = string | { to: string; state?: unknown };

type DatagridProps<T extends RaRecord = RaRecord> = {
  children: ReactNode;
  empty?: boolean;
  emptyNode?: ReactNode;
  rowClick?: false | ((record: T) => RowClickResult);
  expandPanel?: (record: T) => ReactNode;
  prependData?: T[];
  rowActions?: (record: T) => ReactNode;
};

export const Datagrid = <T extends RaRecord>({
  children,
  empty,
  emptyNode,
  rowClick,
  expandPanel,
  prependData,
  rowActions,
}: DatagridProps<T>) => {
  const { data: listData, isLoading } = useListContext<T>();
  const data = listData ?? [];

  if (isLoading) {
    return <Loader />;
  }

  return (
    <DataTable<T>
      data={data}
      empty={empty}
      emptyNode={emptyNode}
      rowClick={rowClick}
      expandPanel={expandPanel}
      prependData={prependData}
      rowActions={rowActions}
    >
      {children}
    </DataTable>
  );
};

type DataTableProps<T extends RaRecord = RaRecord> = {
  children: ReactNode;
  empty?: boolean;
  emptyNode?: ReactNode;
  rowClick?: false | ((record: T) => RowClickResult);
  expandPanel?: (record: T) => ReactNode;
  data: T[];
  prependData?: T[];
  rowActions?: (record: T) => ReactNode;
};

export const DataTable = <T extends RaRecord>({
  children,
  empty,
  emptyNode,
  rowClick,
  expandPanel,
  data,
  prependData,
  rowActions,
}: DataTableProps<T>) => {
  const resource = useResourceContext();
  const columns = Children.toArray(children).filter(isValidElement);
  const navigate = useNavigate();
  const hasRowClick = rowClick !== false;

  // Only render the actions column when at least one row actually produces an action.
  const allRows = [...(prependData ?? []), ...data];
  const hasAnyAction =
    rowActions != null && allRows.some((r) => rowActions(r) != null);

  const handleRowClick = (
    e: React.MouseEvent<HTMLTableRowElement>,
    record: T,
  ) => {
    if (!hasRowClick) return;

    const target = e.target as HTMLElement;
    // We dont want to navigate if the target is a button or a link, or a modal
    // overlay, because it's handled by the button or link itself.
    if (target.closest("button, a, .eds-modal__overlay")) {
      return;
    }

    const result =
      typeof rowClick === "function"
        ? rowClick(record)
        : `/${resource}/${record.id}/show`;

    if (typeof result === "string") {
      navigate(result);
    } else {
      navigate(result.to, { state: result.state });
    }
  };

  if (
    data.length === 0 &&
    (prependData ?? []).length === 0 &&
    empty !== false
  ) {
    return emptyNode !== undefined ? (
      emptyNode
    ) : (
      <BodyText>No results</BodyText>
    );
  }

  return (
    <Table size="medium" style={{ width: "100%" }}>
      <Table.Header>
        <Table.Row>
          {expandPanel && <Table.ColumnHeader style={{ width: "1px" }} />}
          {columns.map((child, index) => {
            const { source, label, reference, headerTooltip, children } =
              child.props as {
                source: string;
                label?: string;
                reference: string;
                headerTooltip?: boolean;
                // Children is only set when it is a reference field
                children: React.ReactElement<{ source: string }>;
              };
            const childSource = children?.props?.source;

            return (
              <Table.ColumnHeader key={index} scope="col">
                <span className="flex items-center gap-1">
                  <FieldTitle
                    source={childSource ?? source}
                    label={label}
                    resource={reference ?? resource}
                  />
                  {reference && !label && (
                    <span className="text-neutral-500">
                      ({humanize(reference)})
                    </span>
                  )}
                  {headerTooltip && source && (
                    <FieldTooltip resource={resource} field={source} />
                  )}
                </span>
              </Table.ColumnHeader>
            );
          })}
          {hasAnyAction && (
            <Table.ColumnHeader style={{ width: "1px" }} aria-label="Actions" />
          )}
        </Table.Row>
      </Table.Header>
      <Table.Body>
        {(prependData ?? []).map((record) => (
          <RecordContextProvider key={record.id} value={record}>
            {expandPanel ? (
              <Table.ExpandableRow
                style={hasRowClick ? { cursor: "pointer" } : undefined}
                onClick={(e) => handleRowClick(e, record)}
                content={
                  <RecordContextProvider value={record}>
                    {expandPanel(record)}
                  </RecordContextProvider>
                }
              >
                {columns.map((child, index) => (
                  <Table.DataCell key={index}>
                    {cloneElement(child)}
                  </Table.DataCell>
                ))}
                {hasAnyAction && (
                  <Table.DataCell>{rowActions!(record)}</Table.DataCell>
                )}
              </Table.ExpandableRow>
            ) : (
              <Table.Row
                style={hasRowClick ? { cursor: "pointer" } : undefined}
                onClick={(e) => handleRowClick(e, record)}
              >
                {columns.map((child, index) => (
                  <Table.DataCell key={index}>
                    {cloneElement(child)}
                  </Table.DataCell>
                ))}
                {hasAnyAction && (
                  <Table.DataCell>{rowActions!(record)}</Table.DataCell>
                )}
              </Table.Row>
            )}
          </RecordContextProvider>
        ))}
        {data.map((record) => (
          <RecordContextProvider key={record.id} value={record}>
            {expandPanel ? (
              <Table.ExpandableRow
                style={hasRowClick ? { cursor: "pointer" } : undefined}
                onClick={(e) => handleRowClick(e, record)}
                content={
                  <RecordContextProvider value={record}>
                    {expandPanel(record)}
                  </RecordContextProvider>
                }
              >
                {columns.map((child, index) => (
                  <Table.DataCell key={index}>
                    {cloneElement(child)}
                  </Table.DataCell>
                ))}
                {hasAnyAction && (
                  <Table.DataCell>{rowActions!(record)}</Table.DataCell>
                )}
              </Table.ExpandableRow>
            ) : (
              <Table.Row
                style={hasRowClick ? { cursor: "pointer" } : undefined}
                onClick={(e) => handleRowClick(e, record)}
              >
                {columns.map((child, index) => (
                  <Table.DataCell key={index}>
                    {cloneElement(child)}
                  </Table.DataCell>
                ))}
                {hasAnyAction && (
                  <Table.DataCell>{rowActions!(record)}</Table.DataCell>
                )}
              </Table.Row>
            )}
          </RecordContextProvider>
        ))}
      </Table.Body>
    </Table>
  );
};

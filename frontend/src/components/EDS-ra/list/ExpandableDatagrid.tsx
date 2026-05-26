import React, {
  Children,
  ReactNode,
  cloneElement,
  isValidElement,
} from "react";
import { useNavigate } from "react-router-dom";
import {
  FieldTitle,
  RaRecord,
  RecordContextProvider,
  useResourceContext,
  useListContext,
} from "ra-core";
import { BodyText, Loader, Table } from "../../ui";
import { FieldTooltip } from "../fields";

type ExpandableDatagridProps<T extends RaRecord = RaRecord> = {
  children: ReactNode;
  expandPanel: (record: T) => ReactNode;
  rowClick?: false | ((record: T) => string);
};

export const ExpandableDatagrid = <T extends RaRecord>({
  children,
  expandPanel,
  rowClick,
}: ExpandableDatagridProps<T>) => {
  const { data: listData, isLoading } = useListContext<T>();
  const data = listData ?? [];

  if (isLoading) {
    return <Loader />;
  }

  return (
    <ExpandableDataTable<T>
      data={data}
      expandPanel={expandPanel}
      rowClick={rowClick}
    >
      {children}
    </ExpandableDataTable>
  );
};

type ExpandableDataTableProps<T extends RaRecord = RaRecord> = {
  children: ReactNode;
  expandPanel: (record: T) => ReactNode;
  rowClick?: false | ((record: T) => string);
  data: T[];
};

export const ExpandableDataTable = <T extends RaRecord>({
  children,
  expandPanel,
  rowClick,
  data,
}: ExpandableDataTableProps<T>) => {
  const resource = useResourceContext();
  const columns = Children.toArray(children).filter(isValidElement);
  const navigate = useNavigate();

  const handleRowClick = (
    e: React.MouseEvent<HTMLTableRowElement>,
    record: T,
  ) => {
    if (rowClick === false) return;

    const target = e.target as HTMLElement;
    if (target.closest("button, a, .eds-modal__overlay")) {
      return;
    }

    const url =
      typeof rowClick === "function"
        ? rowClick(record)
        : `/${resource}/${record.id}/show`;

    navigate(url);
  };

  if (data.length === 0) {
    return <BodyText>No results</BodyText>;
  }

  return (
    <Table style={{ width: "100%" }}>
      <Table.Header>
        <Table.Row>
          <Table.HeaderCell />
          {columns.map((child, index) => {
            const { source, label, reference, headerTooltip, children } =
              child.props as {
                source: string;
                label?: string;
                reference: string;
                headerTooltip?: boolean;
                children: React.ReactElement<{ source: string }>;
              };
            const childSource = children?.props?.source;

            return (
              <Table.HeaderCell
                key={source ?? childSource ?? index}
                scope="col"
              >
                <span className="flex items-center gap-1">
                  <FieldTitle
                    source={childSource ?? source}
                    label={label}
                    resource={reference ?? resource}
                  />
                  {headerTooltip && source && (
                    <FieldTooltip resource={resource} field={source} />
                  )}
                </span>
              </Table.HeaderCell>
            );
          })}
        </Table.Row>
      </Table.Header>
      <Table.Body>
        {data.map((record) => (
          <RecordContextProvider key={record.id} value={record}>
            <Table.ExpandableRow
              style={{ cursor: "pointer" }}
              onClick={(e) => handleRowClick(e, record)}
              content={
                <RecordContextProvider value={record}>
                  {expandPanel(record)}
                </RecordContextProvider>
              }
            >
              {columns.map((child, index) => {
                const key =
                  (child.props as { source?: string }).source ?? index;
                return (
                  <Table.DataCell key={key}>
                    {cloneElement(child)}
                  </Table.DataCell>
                );
              })}
            </Table.ExpandableRow>
          </RecordContextProvider>
        ))}
      </Table.Body>
    </Table>
  );
};

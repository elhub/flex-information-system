import React, {
  Children,
  ReactNode,
  cloneElement,
  isValidElement,
  useContext,
} from "react";
import { useNavigate } from "react-router-dom";
import {
  FieldTitle,
  ListContext,
  RaRecord,
  RecordContextProvider,
  useResourceContext,
} from "ra-core";
import { BodyText, Loader, Table } from "../../ui";

type DatagridProps<T extends RaRecord = RaRecord> = {
  children: ReactNode;
  empty?: boolean;
  rowClick?: false | ((record: RaRecord) => string);
  data?: T[];
};

export const Datagrid = <T extends RaRecord>({
  children,
  empty,
  rowClick,
  data: dataProp,
}: DatagridProps<T>) => {
  // try to get data from list context if not provided directly
  const listContext = useContext(ListContext);
  const data = dataProp ?? listContext?.data ?? [];
  const isLoading = listContext?.isLoading;
  const resource = useResourceContext();
  const rows = data ?? [];
  const columns = Children.toArray(children).filter(isValidElement);
  const navigate = useNavigate();
  const hasRowClick = rowClick !== false;

  const handleRowClick = (
    e: React.MouseEvent<HTMLTableRowElement>,
    record: RaRecord,
  ) => {
    if (!hasRowClick) return;

    const target = e.target as HTMLElement;
    // We dont want to navigate if the target is a button or a link, or a modal
    // overlay, because it's handled by the button or link itself.
    if (target.closest("button, a, .eds-modal__overlay")) {
      return;
    }

    const url =
      typeof rowClick === "function"
        ? rowClick(record)
        : `/${resource}/${record.id}/show`;

    navigate(url);
  };

  // Only show loading when using list context (not when data is passed directly)
  if (!dataProp && isLoading) {
    return <Loader />;
  }

  if (rows.length === 0 && empty !== false) {
    return <BodyText>No results</BodyText>;
  }

  return (
    <Table>
      <Table.Header>
        <Table.Row>
          {columns.map((child, index) => {
            const { source } = child.props as {
              source: string;
            };
            return (
              <Table.ColumnHeader key={source ?? index} scope="col">
                <FieldTitle source={source} resource={resource} />
              </Table.ColumnHeader>
            );
          })}
        </Table.Row>
      </Table.Header>
      <Table.Body>
        {rows.map((record) => (
          <RecordContextProvider key={record.id} value={record}>
            <Table.Row
              style={hasRowClick ? { cursor: "pointer" } : undefined}
              onClick={(e) => handleRowClick(e, record)}
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
            </Table.Row>
          </RecordContextProvider>
        ))}
      </Table.Body>
    </Table>
  );
};

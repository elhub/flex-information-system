import { Children, ReactNode, cloneElement, isValidElement } from "react";
import { useNavigate } from "react-router-dom";
import {
  FieldTitle,
  RaRecord,
  RecordContextProvider,
  useListContext,
  useResourceContext,
} from "ra-core";
import { BodyText, Loader, Table } from "../../ui";

type DatagridProps = {
  children: ReactNode;
  empty?: boolean;
  rowClick?: (record: RaRecord) => string;
};

export const Datagrid = <T extends RaRecord>({
  children,
  empty,
  rowClick,
}: DatagridProps) => {
  const { data, isLoading } = useListContext<T>();
  const resource = useResourceContext();
  const rows = data ?? [];
  const columns = Children.toArray(children).filter(isValidElement);
  const navigate = useNavigate();

  const handleRowClick = (record: RaRecord) => {
    const target = rowClick
      ? rowClick(record)
      : `/${resource}/${record.id}/show`;
    navigate(target);
  };

  if (isLoading) {
    return <Loader />;
  }

  if (!rows.length && empty !== false) {
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
              style={{ cursor: "pointer" }}
              onClick={() => handleRowClick(record)}
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

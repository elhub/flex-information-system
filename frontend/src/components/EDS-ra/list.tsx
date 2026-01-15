import { Children, ReactNode, cloneElement, isValidElement } from "react";
import { useNavigate } from "react-router-dom";
import {
  FieldTitle,
  FilterLiveForm,
  ListBase,
  ListBaseProps,
  RecordContextProvider,
  useListContext,
  useResourceContext,
  RaRecord,
} from "ra-core";
import {
  BodyText,
  FlexDiv,
  Loader,
  Pagination,
  Panel,
  Table,
  VerticalSpace,
} from "@elhub/ds-components";

type ListProps = ListBaseProps & {
  filters?: ReactNode;
  empty?: boolean;
};

export const List = ({ children, filters, empty, ...rest }: ListProps) => {
  const filterItems = Array.isArray(filters)
    ? filters
    : filters
      ? [filters]
      : [];

  if (empty) {
    return (
      <ListBase {...rest}>
        <Panel border>
          <BodyText>No results</BodyText>
        </Panel>
      </ListBase>
    );
  }

  return (
    <ListBase {...rest}>
      <Panel border>
        {filterItems.length ? (
          <>
            <ListFilters filters={filterItems} />
            <VerticalSpace />
          </>
        ) : null}
        {children}
        <VerticalSpace />
        <ListPagination />
      </Panel>
    </ListBase>
  );
};

type ListFiltersProps = {
  filters: ReactNode[];
};

const ListFilters = ({ filters }: ListFiltersProps) => (
  <FilterLiveForm>
    <FlexDiv style={{ gap: "1rem", flexWrap: "wrap" }}>{filters}</FlexDiv>
  </FilterLiveForm>
);

const ListPagination = () => {
  const { page, perPage, setPage, total } = useListContext();

  if (!total || total <= 1) {
    return null;
  }

  const pageCount = Math.ceil(total / perPage);

  return (
    <Pagination
      count={pageCount}
      page={page}
      onPageChange={setPage}
      prevText="Previous"
      nextText="Next"
    />
  );
};

type DatagridProps = {
  children: ReactNode;
  empty?: boolean;
};

export const Datagrid = <T extends RaRecord>({
  children,
  empty,
}: DatagridProps) => {
  const { data, isLoading } = useListContext<T>();
  const resource = useResourceContext();
  const rows = data ?? [];
  const columns = Children.toArray(children).filter(isValidElement);
  const navigate = useNavigate();

  const handleRowClick = (record: RaRecord) => {
    navigate(`/${resource}/${record.id}/show`);
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
            const { source, label } = child.props as {
              source: string;
              label: string;
            };
            return (
              <Table.ColumnHeader key={source ?? index} scope="col">
                <FieldTitle label={label} source={source} resource={resource} />
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

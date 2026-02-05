import { ReactNode } from "react";
import {
  FilterLiveForm,
  ListBase,
  ListBaseProps,
  useListContext,
} from "ra-core";
import { BodyText, Pagination, Panel } from "../../ui";

type ListProps = ListBaseProps & {
  filters?: ReactNode[];
  empty?: boolean;
  actions?: ReactNode[];
};

export const List = ({
  children,
  filters,
  empty,
  actions,
  ...rest
}: ListProps) => {
  return (
    <ListBase {...rest}>
      <div className="flex flex-col gap-2">
        {actions && <ListActions actions={actions} />}
        <Panel border className="flex flex-col gap-5">
          {filters?.length ? <ListFilters filters={filters} /> : null}
          {empty ? <BodyText>No results</BodyText> : children}
          <ListPagination />
        </Panel>
      </div>
    </ListBase>
  );
};

type ListFiltersProps = {
  filters: ReactNode[];
};

const ListFilters = ({ filters }: ListFiltersProps) => (
  <FilterLiveForm>
    <div className="flex gap-2 flex-wrap">{filters}</div>
  </FilterLiveForm>
);

type ListActionsProps = {
  actions: ReactNode[];
};

const ListActions = ({ actions }: ListActionsProps) => (
  <div className="flex justify-end gap-2">{actions}</div>
);

const ListPagination = () => {
  const { page, perPage, setPage, total } = useListContext();

  if (!total) {
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

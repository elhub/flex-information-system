import { ReactNode } from "react";
import {
  FilterLiveForm,
  ListBase,
  ListBaseProps,
  useListContext,
} from "ra-core";
import { BodyText, FlexDiv, Pagination, Panel, VerticalSpace } from "../../ui";

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
  if (empty) {
    return (
      <ListBase {...rest}>
        {actions && <ListActions actions={actions} />}
        <VerticalSpace />
        <Panel border>
          <BodyText>No results</BodyText>
        </Panel>
      </ListBase>
    );
  }

  return (
    <ListBase {...rest}>
      {actions && <ListActions actions={actions} />}
      <Panel border>
        {filters?.length ? (
          <>
            <ListFilters filters={filters} />
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

type ListActionsProps = {
  actions: ReactNode[];
};

const ListActions = ({ actions }: ListActionsProps) => (
  <FlexDiv style={{ justifyContent: "flex-end", gap: "1rem" }}>
    {actions}
  </FlexDiv>
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

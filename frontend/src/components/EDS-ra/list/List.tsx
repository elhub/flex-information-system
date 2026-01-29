import { ReactNode } from "react";
import {
  FilterLiveForm,
  ListBase,
  ListBaseProps,
  useListContext,
} from "ra-core";
import { BodyText, FlexDiv, Pagination, Panel } from "../../ui";

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
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: "var(--eds-size-1)",
        }}
      >
        {actions && <ListActions actions={actions} />}
        <Panel
          border
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "var(--eds-size-5)",
          }}
        >
          {filters?.length ? (
            <>
              <ListFilters filters={filters} />
            </>
          ) : null}
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

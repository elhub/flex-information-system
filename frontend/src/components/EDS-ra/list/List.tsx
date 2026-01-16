import { ReactNode } from "react";
import {
  FilterLiveForm,
  ListBase,
  ListBaseProps,
  useListContext,
} from "ra-core";
import {
  BodyText,
  FlexDiv,
  Pagination,
  Panel,
  VerticalSpace,
} from "@elhub/ds-components";

type ListProps = ListBaseProps & {
  filters?: ReactNode[];
  empty?: boolean;
};

export const List = ({ children, filters, empty, ...rest }: ListProps) => {
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

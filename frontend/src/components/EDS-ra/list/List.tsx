import { ReactNode } from "react";
import {
  FilterLiveForm,
  ListBase,
  ListBaseProps,
  useListContext,
} from "ra-core";
import { BodyText, Pagination, Panel } from "../../ui";
import { Combobox } from "../../../components/ui";

type ListProps = ListBaseProps & {
  filters?: ReactNode[];
  empty?: boolean;
  actions?: ReactNode[];
  pagination?: boolean;
  borderless?: boolean;
};

export const List = ({
  children,
  filters,
  empty,
  actions,
  pagination = true,
  borderless = false,
  ...rest
}: ListProps) => {
  const content = (
    <>
      {filters?.length ? <ListFilters filters={filters} /> : null}
      {empty ? <BodyText>No results</BodyText> : children}
      {pagination && <ListPagination />}
    </>
  );

  return (
    <ListBase perPage={25} {...rest}>
      <div className="flex flex-col gap-2">
        {actions && <ListActions actions={actions} />}
        {borderless ? (
          <div className="flex flex-col gap-5">{content}</div>
        ) : (
          <Panel border className="flex flex-col gap-5">
            {content}
          </Panel>
        )}
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
  const { page, perPage, setPerPage, setPage, total } = useListContext();
  const selectableOptions = ["25", "50", "75", "100"];
  if (!total) {
    return null;
  }

  const pageCount = Math.ceil(total / perPage);

  return (
    <div className="flex items-center gap-4">
      <div className="mr-auto">
        <Pagination
          count={pageCount}
          page={page}
          onPageChange={setPage}
          prevText="Previous"
          nextText="Next"
        />
      </div>
      <div className="w-32 shrink-0">
        <Combobox
          options={selectableOptions}
          selectedOptions={perPage ? [perPage.toString()] : []}
          onToggleSelected={(option) => setPerPage(+option)}
        />
      </div>
    </div>
  );
};

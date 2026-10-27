import { Combobox, FormItem, Pagination } from "../ui";
import type { ListInterface } from "./types";

const PER_PAGE_OPTIONS = ["25", "50", "75", "100"];

export const ListPagination = <T,>({ list }: { list: ListInterface<T> }) => {
  if (!list.total) return null;
  return (
    <div className="flex items-center gap-4">
      <div className="mr-auto">
        <Pagination
          count={Math.ceil(list.total / list.perPage)}
          page={list.page}
          onPageChange={list.setPage}
          prevText="Previous"
          nextText="Next"
        />
      </div>
      <div className="w-32 shrink-0">
        <FormItem size="medium">
          <Combobox
            options={PER_PAGE_OPTIONS}
            selectedOptions={[String(list.perPage)]}
            onToggleSelected={(option) => list.setPerPage(Number(option))}
          />
        </FormItem>
      </div>
    </div>
  );
};

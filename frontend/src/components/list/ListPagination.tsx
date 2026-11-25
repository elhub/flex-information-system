import { useTranslate } from "ra-core";
import { IconChevronLeft, IconChevronRight } from "@elhub/ds-icons";
import { BodyText, Button, Combobox, FormItem, Pagination } from "../ui";
import type { ListInterface } from "./types";

const PER_PAGE_OPTIONS = ["25", "50", "75", "100"];

// Previous/next-only pagination for lists fetched without a total count,
// since counting is too expensive on large data sets.
const PreviousNextPagination = <T,>({ list }: { list: ListInterface<T> }) => {
  const translate = useTranslate();
  return (
    <nav className="mr-auto">
      <ul className="eds-pagination__list">
        <li>
          <Button
            type="button"
            variant="invisible"
            className="eds-pagination__prev-next"
            disabled={list.page <= 1}
            onClick={() => list.setPage(list.page - 1)}
            icon={IconChevronLeft}
          >
            <BodyText weight="bold">
              {translate("text.list_pagination_previous")}
            </BodyText>
          </Button>
        </li>
        <li>
          <Pagination.Item selected>
            <BodyText weight="bold">{list.page}</BodyText>
          </Pagination.Item>
        </li>
        <li>
          <Button
            type="button"
            variant="invisible"
            className="eds-pagination__prev-next"
            disabled={!list.hasNextPage}
            onClick={() => list.setPage(list.page + 1)}
            icon={IconChevronRight}
            iconPosition="right"
          >
            <BodyText weight="bold">
              {translate("text.list_pagination_next")}
            </BodyText>
          </Button>
        </li>
      </ul>
    </nav>
  );
};

export const ListPagination = <T,>({ list }: { list: ListInterface<T> }) => {
  const translate = useTranslate();
  const hasTotal = list.total !== undefined;
  if (
    hasTotal
      ? !list.total
      : list.page <= 1 && !list.hasNextPage && list.rows.length === 0
  ) {
    return null;
  }
  return (
    <div className="flex items-center gap-4">
      {hasTotal ? (
        <div className="mr-auto">
          <Pagination
            count={Math.ceil(list.total! / list.perPage)}
            page={list.page}
            onPageChange={list.setPage}
            prevText={translate("text.list_pagination_previous")}
            nextText={translate("text.list_pagination_next")}
          />
        </div>
      ) : (
        <PreviousNextPagination list={list} />
      )}
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

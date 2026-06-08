import { useTranslate } from "ra-core";
import { Button, Link } from "../../components/ui";

type Props = {
  selectedCount: number;
  totalFlexibleCapacity: number;
  hasChanges: boolean;
  isApplying: boolean;
  submitLabel?: string;
  onClearSelection: () => void;
  onReview: () => void;
  onNext: () => void;
};

export const SelectionFooter = ({
  selectedCount,
  totalFlexibleCapacity,
  hasChanges,
  isApplying,
  submitLabel,
  onClearSelection,
  onReview,
  onNext,
}: Props) => {
  const translate = useTranslate();

  const selectedLabel =
    selectedCount !== 1
      ? translate("text.spg_manage_members_selected_plural", {
          count: selectedCount,
        })
      : translate("text.spg_manage_members_selected_singular");

  return (
    <div className="sticky bottom-0 -mx-3 bg-global-color-grey-200 flex items-center gap-4 px-6 py-4">
      <div className="flex flex-col leading-tight">
        <span className="font-semibold text-sm">{selectedLabel}</span>
        <span className="text-xs text-neutral-500">
          {translate("text.spg_manage_members_total_capacity", {
            capacity: totalFlexibleCapacity,
          })}
        </span>
      </div>
      <div className="flex-1" />
      <Link
        as="button"
        onClick={onClearSelection}
        className="text-sm underline"
      >
        {translate("text.spg_manage_members_clear_selection")}
      </Link>
      <Button variant="secondary" onClick={onReview} disabled={!hasChanges}>
        {translate("text.spg_manage_members_review")}
      </Button>
      <Button variant="primary" onClick={onNext} disabled={isApplying}>
        {submitLabel ?? translate("text.spg_manage_members_submit_next")}
      </Button>
    </div>
  );
};

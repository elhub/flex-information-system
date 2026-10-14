import { Button } from "../../ui";
import { IconCross } from "@elhub/ds-icons";

// clearable on the date pickers puts the cross icon on top of the picker
// icon, so we render our own button next to the picker instead
export const ClearButton = ({ onClear }: { onClear: () => void }) => (
  <Button
    type="button"
    variant="tertiary"
    size="small"
    icon={IconCross}
    aria-label="Clear"
    onClick={onClear}
  >
    Clear
  </Button>
);

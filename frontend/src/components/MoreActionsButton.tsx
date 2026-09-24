import { Button, Dropdown } from "./ui";
import { IconChevronDown } from "@elhub/ds-icons";

export const MoreActionsButton = () => (
  <Button
    as={Dropdown.Toggle}
    variant="tertiary"
    icon={IconChevronDown}
    iconPosition="right"
    aria-label="More actions"
    title="More actions"
  >
    More
  </Button>
);

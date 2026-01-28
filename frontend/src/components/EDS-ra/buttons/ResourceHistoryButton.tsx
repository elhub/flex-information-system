import { ReactNode } from "react";
import { Link } from "react-router-dom";
import { Button } from "../../ui";
import { IconClockReset } from "@elhub/ds-icons";
import {
  useResourceHistory,
  UseResourceHistoryProps,
} from "./hooks/useResourceHistory";

type ResourceHistoryButtonProps = UseResourceHistoryProps & {
  label?: ReactNode;
};

export const ResourceHistoryButton = (props: ResourceHistoryButtonProps) => {
  const { label, ...rest } = props;
  const { to, disabled } = useResourceHistory(rest);

  if (disabled) {
    return null;
  }

  return (
    <Button as={Link} to={to} icon={IconClockReset} variant="invisible">
      {label ?? "View History"}
    </Button>
  );
};

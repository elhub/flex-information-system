import { ReactNode } from "react";
import { Link } from "react-router-dom";
import { Button } from "../../ui";
import { IconClockReset } from "@elhub/ds-icons";
import {
  useNestedResourceHistory,
  UseNestedResourceHistoryProps,
} from "./hooks/useNestedResourceHistory";

type NestedHistoryButtonProps = UseNestedResourceHistoryProps & {
  label?: ReactNode;
};

export const NestedResourceHistoryButton = (
  props: NestedHistoryButtonProps,
) => {
  const { label, ...rest } = props;
  const { to, disabled } = useNestedResourceHistory(rest);

  return (
    <Button
      as={Link}
      to={to}
      icon={IconClockReset}
      variant="invisible"
      disabled={disabled}
    >
      {label ?? "View History"}
    </Button>
  );
};

import { ReactNode } from "react";
import { Link } from "react-router-dom";
import { Button } from "../../ui";
import { IconAlarmBell } from "@elhub/ds-icons";
import { useEvent, UseEventProps } from "./hooks/useEvent";

type EventButtonProps = UseEventProps & {
  label?: ReactNode;
};

export const EventButton = (props: EventButtonProps) => {
  const { label, ...rest } = props;
  const { to, disabled } = useEvent(rest);

  if (disabled) {
    return null;
  }

  return (
    <Button as={Link} to={to} icon={IconAlarmBell} variant="invisible">
      {label ?? "Events"}
    </Button>
  );
};

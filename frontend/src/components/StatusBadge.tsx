import { ComponentType, ReactNode } from "react";
import { SvgIconProps } from "@elhub/ds-icons";
import { Badge, Tooltip } from "./ui";

export type StatusVariant = {
  status:
    | "ongoing"
    | "failed"
    | "approved-with-warning"
    | "approved"
    | "stopped"
    | "temporarily-stopped";
  icon: ComponentType<SvgIconProps>;
};

type StatusBadgeProps = {
  label: ReactNode;
  status: StatusVariant["status"];
  icon?: StatusVariant["icon"];
  tooltip?: string;
};

export const StatusBadge = ({
  label,
  status,
  icon,
  tooltip,
}: StatusBadgeProps) => {
  const badge = (
    <Badge
      size="small"
      status={status}
      variant="block"
      icon={icon}
      className="whitespace-nowrap"
    >
      {label}
    </Badge>
  );
  return tooltip ? <Tooltip content={tooltip}>{badge}</Tooltip> : badge;
};

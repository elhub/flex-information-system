import { ComponentType } from "react";
import { useRecordContext, useTranslate } from "ra-core";
import { SvgIconProps } from "@elhub/ds-icons";
import { Badge } from "../../ui";

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

type StatusBadgeFieldProps = {
  source: string;
  enumKey: string;
  variantMap: Record<string, StatusVariant>;
};

export const StatusBadgeField = ({
  source,
  enumKey,
  variantMap,
}: StatusBadgeFieldProps) => {
  const translate = useTranslate();
  const record = useRecordContext();
  const value: string = record?.[source];

  if (!value) return null;

  const variant = variantMap[value];
  if (!variant) return null;

  return (
    <Badge
      size="small"
      status={variant.status}
      variant="block"
      icon={variant.icon}
      style={{ whiteSpace: "nowrap" }}
    >
      {translate(`enum.${enumKey}.${value}`)}
    </Badge>
  );
};

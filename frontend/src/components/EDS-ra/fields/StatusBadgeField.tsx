import { useRecordContext, useTranslate } from "ra-core";
import { StatusBadge, StatusVariant } from "../../StatusBadge";

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
    <StatusBadge
      status={variant.status}
      icon={variant.icon}
      label={translate(`enum.${enumKey}.${value}`)}
    />
  );
};

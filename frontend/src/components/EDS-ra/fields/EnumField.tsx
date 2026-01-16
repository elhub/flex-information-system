import { Tag } from "@elhub/ds-components";
import { useRecordContext, useTranslate } from "ra-core";
import { BaseField, BaseFieldProps } from "./BaseField";

type EnumFieldProps = BaseFieldProps & {
  enumKey: string;
};

export const EnumField = ({
  enumKey,
  source,
  label,
  tooltip,
}: EnumFieldProps) => {
  const translate = useTranslate();
  const record = useRecordContext();
  const value = record?.[source];
  const content =
    value == null || value === "" ? null : (
      <Tag variant="info">{translate(`enum.${enumKey}.${value}`)}</Tag>
    );

  return (
    <BaseField source={source} label={label} tooltip={tooltip}>
      {content}
    </BaseField>
  );
};

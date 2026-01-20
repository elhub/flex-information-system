import { BodyText } from "../../ui";
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
      <BodyText>{translate(`enum.${enumKey}.${value}`)}</BodyText>
    );

  return (
    <BaseField source={source} label={label} tooltip={tooltip}>
      {content}
    </BaseField>
  );
};

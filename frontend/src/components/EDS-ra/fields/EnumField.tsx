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
  labelDirection = "row",
  textSize = "small",
}: EnumFieldProps) => {
  const translate = useTranslate();
  const record = useRecordContext();
  const value = record?.[source];
  const content =
    value == null || value === "" ? null : (
      <BodyText size={textSize}>
        {translate(`enum.${enumKey}.${value}`)}
      </BodyText>
    );

  return (
    <BaseField
      source={source}
      label={label}
      tooltip={tooltip}
      labelDirection={labelDirection}
      textSize={textSize}
    >
      {content}
    </BaseField>
  );
};

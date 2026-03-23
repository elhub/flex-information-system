import { ReactNode } from "react";
import { BodyText } from "../../ui";
import { useRecordContext } from "ra-core";
import { BaseField, BaseFieldProps } from "./BaseField";

type TextFieldProps = BaseFieldProps & {
  emptyText?: ReactNode;
};

export const TextField = ({
  source,
  emptyText,
  label,
  tooltip,
  unit,
  textSize = "small",
}: TextFieldProps) => {
  const record = useRecordContext();
  const value = record?.[source];
  const content =
    value == null || value === "" ? (
      emptyText ? (
        <BodyText size={textSize}>{emptyText}</BodyText>
      ) : null
    ) : (
      <BodyText size={textSize}>{String(value)}</BodyText>
    );

  return (
    <BaseField
      textSize={textSize}
      source={source}
      label={label}
      tooltip={tooltip}
      unit={unit}
    >
      {content}
    </BaseField>
  );
};

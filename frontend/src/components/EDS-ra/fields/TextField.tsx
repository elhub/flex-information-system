import { ReactNode } from "react";
import { BodyText } from "../../ui";
import { useRecordContext } from "ra-core";
import { BaseField, BaseFieldProps } from "./BaseField";

type TextFieldProps = BaseFieldProps & {
  emptyText?: ReactNode;
  weight?: "regular" | "bold" | "semibold";
  hideLabel?: boolean;
};

export const TextField = ({
  source,
  emptyText,
  label,
  hideLabel,
  tooltip,
  unit,
  textSize = "small",
  weight,
}: TextFieldProps) => {
  const record = useRecordContext();
  const value = record?.[source];
  const content =
    value == null || value === "" ? (
      emptyText ? (
        <BodyText size={textSize}>{emptyText}</BodyText>
      ) : null
    ) : (
      <BodyText size={textSize} weight={weight}>{String(value)}</BodyText>
    );

  return (
    <BaseField
      textSize={textSize}
      source={source}
      label={hideLabel ? false : label}
      tooltip={tooltip}
      unit={unit}
    >
      {content}
    </BaseField>
  );
};

import { ReactNode } from "react";
import { useRecordContext } from "ra-core";
import { BaseField, BaseFieldProps } from "./BaseField";
import { BodyText } from "../../ui";
import { toDateTimeString } from "../../../util";

type DateFieldProps = BaseFieldProps & {
  showTime?: boolean;
  emptyText?: ReactNode;
  hideLabel?: boolean;
};

export const DateField = ({
  source,
  showTime,
  emptyText,
  label,
  hideLabel,
  tooltip,
  textSize = "small",
}: DateFieldProps) => {
  const record = useRecordContext();
  const value = record?.[source];
  const content = value ? (
    <BodyText size={textSize}>
      {toDateTimeString(value, { showTime: showTime ?? false })}
    </BodyText>
  ) : emptyText ? (
    <BodyText size={textSize}>{emptyText}</BodyText>
  ) : null;

  return (
    <BaseField
      source={source}
      label={hideLabel ? false : label}
      tooltip={tooltip}
      textSize={textSize}
    >
      {content}
    </BaseField>
  );
};

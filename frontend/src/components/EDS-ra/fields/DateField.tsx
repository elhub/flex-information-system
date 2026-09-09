import { ReactNode } from "react";
import { useRecordContext } from "ra-core";
import { BaseField, BaseFieldProps } from "./BaseField";
import { BodyText } from "../../ui";

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
      {new Date(value).toLocaleString(
        "no-NO",
        showTime
          ? { dateStyle: "medium", timeStyle: "short", hour12: false }
          : { dateStyle: "medium" },
      )}
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

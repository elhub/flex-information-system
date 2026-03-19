import { ReactNode } from "react";
import { useRecordContext } from "ra-core";
import { BaseField, BaseFieldProps } from "./BaseField";
import { BodyText } from "../../ui";

type DateFieldProps = BaseFieldProps & {
  showTime?: boolean;
  emptyText?: ReactNode;
};

export const DateField = ({
  source,
  showTime,
  emptyText,
  label,
  tooltip,
  textSize = "medium",
}: DateFieldProps) => {
  const record = useRecordContext();
  const value = record?.[source];
  const content = value ? (
    (() => {
      const date = new Date(value);
      const options: Intl.DateTimeFormatOptions = showTime
        ? { dateStyle: "medium", timeStyle: "short", hour12: false }
        : { dateStyle: "medium" };
      return (
        <BodyText size="small">
          {date.toLocaleString("no-NO", options)}
        </BodyText>
      );
    })()
  ) : emptyText ? (
    <BodyText size="small">{emptyText}</BodyText>
  ) : null;

  return (
    <BaseField
      source={source}
      label={label}
      tooltip={tooltip}
      textSize={textSize}
    >
      {content}
    </BaseField>
  );
};

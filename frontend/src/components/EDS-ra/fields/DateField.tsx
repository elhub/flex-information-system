import { ReactNode } from "react";
import { BodyText } from "@elhub/ds-components";
import { useRecordContext } from "ra-core";
import { BaseField, BaseFieldProps } from "./BaseField";

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
}: DateFieldProps) => {
  const record = useRecordContext();
  const value = record?.[source];
  const content = value ? (
    (() => {
      const date = new Date(value);
      const options: Intl.DateTimeFormatOptions = showTime
        ? { dateStyle: "medium", timeStyle: "short", hour12: false }
        : { dateStyle: "medium" };
      return <BodyText>{date.toLocaleString("no-NO", options)}</BodyText>;
    })()
  ) : emptyText ? (
    <BodyText>{emptyText}</BodyText>
  ) : null;

  return (
    <BaseField source={source} label={label} tooltip={tooltip}>
      {content}
    </BaseField>
  );
};

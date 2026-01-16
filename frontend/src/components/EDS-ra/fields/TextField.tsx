import { ReactNode } from "react";
import { BodyText } from "@elhub/ds-components";
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
}: TextFieldProps) => {
  const record = useRecordContext();
  const value = record?.[source];
  const content =
    value == null || value === "" ? (
      emptyText ? (
        <BodyText>{emptyText}</BodyText>
      ) : null
    ) : (
      <BodyText>{String(value)}</BodyText>
    );

  return (
    <BaseField source={source} label={label} tooltip={tooltip}>
      {content}
    </BaseField>
  );
};

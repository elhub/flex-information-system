import { ReactNode } from "react";
import { BodyText, Chips } from "../../ui";
import { useRecordContext } from "ra-core";
import { BaseField, BaseFieldProps } from "./BaseField";

type ScopesFieldProps = BaseFieldProps & {
  emptyText?: ReactNode;
};

export const ScopesField = ({
  source,
  emptyText,
  label,
  tooltip,
}: ScopesFieldProps) => {
  const record = useRecordContext();
  const value = record?.[source];
  const scopes = Array.isArray(value) ? value : [];

  const content =
    scopes.length > 0 ? (
      <Chips>
        {scopes.map((scope) => (
          <Chips.Chip key={String(scope)}>{String(scope)}</Chips.Chip>
        ))}
      </Chips>
    ) : emptyText ? (
      <BodyText>{emptyText}</BodyText>
    ) : null;

  return (
    <BaseField source={source} label={label} tooltip={tooltip}>
      {content}
    </BaseField>
  );
};

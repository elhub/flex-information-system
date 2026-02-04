import { BodyText } from "../../ui";
import { useRecordContext } from "ra-core";

// Text field with diff highlighting based on whether the field changed
type DiffTextFieldProps = {
  source: string;
  changed: boolean;
};

export const DiffTextField = ({ source, changed }: DiffTextFieldProps) => {
  const record = useRecordContext<{
    isNewRecord: boolean;
    [key: string]: unknown;
  }>();
  const value = record?.[source];
  return (
    <BodyText
      style={
        changed
          ? record?.isNewRecord
            ? { color: "green" }
            : { color: "red", textDecoration: "line-through" }
          : {}
      }
    >
      {value == null ? "" : String(value)}
    </BodyText>
  );
};

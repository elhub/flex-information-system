import { Datepicker } from "../../ui";
import { useInput } from "ra-core";
import { BaseInput, BaseInputProps } from "./BaseInput";
import { formatDateToMidnightISO } from "../../datetime";

type DateTimeInputProps = BaseInputProps;

export const DateInput = ({
  source,
  required,
  tooltip,
  readOnly,
  disabled,
  ...rest
}: DateTimeInputProps) => {
  const { id, field, fieldState } = useInput({ source, ...rest });

  const formatDate = (date: Date) =>
    formatDateToMidnightISO(date.toISOString());

  return (
    <BaseInput
      source={source}
      required={required}
      tooltip={tooltip}
      disabled={disabled}
      readOnly={readOnly}
      id={id}
      error={fieldState.error?.message}
    >
      <Datepicker
        id={id}
        selected={field.value ? new Date(field.value) : null}
        onSelect={(date) => field.onChange(date ? formatDate(date) : null)}
        onBlur={field.onBlur}
        disabled={disabled}
      />
    </BaseInput>
  );
};

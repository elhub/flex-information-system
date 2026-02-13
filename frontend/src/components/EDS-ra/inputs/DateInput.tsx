import { Datepicker, DatepickerProps } from "../../ui";
import { useInput } from "ra-core";
import { BaseInput, BaseInputProps } from "./BaseInput";
import { formatISO, parseISO } from "date-fns";
import { tz } from "@date-fns/tz";

type DateTimeInputProps = BaseInputProps & DatepickerProps;

export const DateInput = ({
  source,
  required,
  tooltip,
  readOnly,
  disabled,
  ...rest
}: DateTimeInputProps) => {
  const { id, field, fieldState } = useInput({ source, ...rest });

  const onDateChange = (date: Date | null) => {
    field.onChange(
      date
        ? formatISO(date, { representation: "date", in: tz("Europe/Oslo") })
        : null,
    );
  };

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
        {...rest}
        id={id}
        selected={
          field.value
            ? parseISO(field.value, { in: tz("Europe/Oslo") })
            : undefined
        }
        onChange={(date) => onDateChange(date)}
        onBlur={field.onBlur}
        size="large"
        disabled={disabled}
        navigateButtons={false}
      />
    </BaseInput>
  );
};

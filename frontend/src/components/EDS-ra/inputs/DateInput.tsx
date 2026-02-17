import { Datepicker } from "../../ui";
import { useInput } from "ra-core";
import { BaseInput, BaseInputProps } from "./BaseInput";
import { formatISO, parseISO } from "date-fns";
import { tz } from "@date-fns/tz";

type DateTimeInputProps = BaseInputProps & {
  // tells whether the date input component should internally store a timestamp
  // in addition to the date (useful for midnight aligned fields)
  storeMidnight: boolean;
};

const FlexibleDateInput = ({
  source,
  required,
  tooltip,
  readOnly,
  disabled,
  storeMidnight,
  ...rest
}: DateTimeInputProps) => {
  const { id, field, fieldState } = useInput({ source, ...rest });

  const onDateChange = (date: Date | null) => {
    field.onChange(
      date
        ? formatISO(date, {
            representation: storeMidnight ? "complete" : "date",
            in: tz("Europe/Oslo"),
          })
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

// input YYYY-MM-DD, store YYYY-MM-DD
export const DateInput = (props: BaseInputProps) => (
  <FlexibleDateInput {...props} storeMidnight={false} />
);

// input YYYY-MM-DD, store YYYY-MM-DD 00:00 Europe/Oslo converted to ISO format
export const MidnightDateInput = (props: BaseInputProps) => (
  <FlexibleDateInput {...props} storeMidnight />
);

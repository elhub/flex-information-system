import { Datepicker } from "../../ui";
import { useInput } from "ra-core";
import { BaseInput, BaseInputProps } from "./BaseInput";
import { formatISO, parseISO } from "date-fns";
import { tz } from "@date-fns/tz";

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
        onChange={(date) =>
          field.onChange(
            date ? formatISO(date, { in: tz("Europe/Oslo") }) : null,
          )
        }
        onBlur={field.onBlur}
        size="large"
        disabled={disabled}
        navigateButtons={false}
      />
    </BaseInput>
  );
};

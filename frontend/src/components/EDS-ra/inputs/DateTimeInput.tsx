import { DateTimePicker } from "../../ui";
import { useInput } from "ra-core";
import { BaseInput, BaseInputProps } from "./BaseInput";
import { formatISO, parseISO } from "date-fns";
import { tz } from "@date-fns/tz";
import { Button } from "../../ui";
import { IconCross, IconClockCircle } from "@elhub/ds-icons";

type DateTimeInputProps = BaseInputProps & {
  showNow?: boolean;
};

export const DateTimeInput = ({
  source,
  required,
  tooltip,
  readOnly,
  disabled,
  showNow,
  ...rest
}: DateTimeInputProps) => {
  const { id, field, fieldState } = useInput({ source, ...rest });

  const onDateChange = (date: Date | null) => {
    field.onChange(
      date
        ? formatISO(date, {
            representation: "complete",
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
      <div className="flex items-center gap-1">
        <DateTimePicker
          id={id}
          selected={
            field.value
              ? parseISO(field.value, { in: tz("Europe/Oslo") })
              : undefined
          }
          onChange={(date) => onDateChange(date)}
          onBlur={field.onBlur}
          size="large"
          disabled={disabled || readOnly}
          navigateButtons={false}
        />
        {showNow && !disabled && !readOnly && (
          <Button
            type="button"
            variant="tertiary"
            size="small"
            icon={IconClockCircle}
            aria-label="Set to now"
            onClick={() => onDateChange(new Date())}
          >
            Now
          </Button>
        )}
        {/* isClearable on the DateTimePicker puts the cross icon on top of the picker icon.
            So we add our own on the side instead */}
        {!required && !disabled && !readOnly && field.value && (
          <Button
            type="button"
            variant="tertiary"
            size="small"
            icon={IconCross}
            aria-label="Clear"
            onClick={() => field.onChange(null)}
          >
            Clear
          </Button>
        )}
      </div>
    </BaseInput>
  );
};

import { Datepicker } from "../../ui";
import { DatepickerProps } from "../../ui/types";
import { useInput } from "ra-core";
import { BaseInput, BaseInputProps } from "./BaseInput";
import { formatISO, parseISO } from "date-fns";
import { tz } from "@date-fns/tz";
import { FlexDiv } from "../../ui";
import { ClearButton } from "./ClearButton";

type DateTimeInputProps = BaseInputProps &
  DatepickerProps & {
    // tells whether the date input component should internally store a
    // timestamp in addition to the date (useful for midnight aligned fields)
    outputFormat?: "date" | "date-time";
    // shows a button to clear the value
    clearable?: boolean;
  };

export const DateInput = ({
  source,
  required,
  tooltip,
  readOnly,
  disabled,
  description,
  descriptionOverride,
  outputFormat = "date",
  clearable,
  ...rest
}: DateTimeInputProps) => {
  const { id, field, fieldState } = useInput({ source, ...rest });

  const onDateChange = (date: Date | null) => {
    field.onChange(
      date
        ? formatISO(date, {
            representation: outputFormat === "date-time" ? "complete" : "date",
            in: tz("Europe/Oslo"),
          })
        : null,
    );
  };

  const displayClearButton =
    clearable && !readOnly && !disabled && Boolean(field.value);

  return (
    <BaseInput
      source={source}
      required={required}
      tooltip={tooltip}
      disabled={disabled}
      readOnly={readOnly}
      id={id}
      error={fieldState.error?.message}
      description={description}
      descriptionOverride={descriptionOverride}
    >
      <FlexDiv style={{ gap: "var(--eds-size-2)", alignItems: "center" }}>
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
        {displayClearButton && (
          <ClearButton onClear={() => onDateChange(null)} />
        )}
      </FlexDiv>
    </BaseInput>
  );
};

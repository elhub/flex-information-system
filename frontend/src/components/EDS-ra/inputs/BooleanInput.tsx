import { Select, SelectContent, SelectItem } from "../../ui";
import { useInput, useTranslate } from "ra-core";
import { BaseInput, BaseInputProps } from "./BaseInput";

export const BooleanInput = ({
  source,
  required,
  tooltip,
  readOnly,
  disabled,
  description,
  descriptionOverride,
  overrideLabel,
}: BaseInputProps) => {
  const { id, field, fieldState } = useInput({ source });
  const translate = useTranslate();

  const value =
    field.value === true ? "true" : field.value === false ? "false" : "";

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
      overrideLabel={overrideLabel}
    >
      <Select
        className="min-w-48"
        value={value}
        onValueChange={(v: string) => field.onChange(v === "true")}
        disabled={disabled || readOnly}
        placeholder={translate("text.select_placeholder")}
      >
        <SelectContent>
          <SelectItem value="true">{translate("text.boolean_yes")}</SelectItem>
          <SelectItem value="false">{translate("text.boolean_no")}</SelectItem>
        </SelectContent>
      </Select>
    </BaseInput>
  );
};

import { Select, SelectContent, SelectItem } from "../../ui";
import { useInput, useTranslate, useI18nProvider } from "ra-core";
import { I18nProvider } from "../../../intl/intl";
import { BaseInput, BaseInputProps } from "./BaseInput";

type EnumInputProps = BaseInputProps & {
  enumKey: string;
  defaultValue?: string;
  onChange?: (value: string) => void;
  placeholder?: string;
};

export const EnumInput = ({
  source,
  required,
  tooltip,
  enumKey,
  readOnly,
  disabled,
  defaultValue,
  onChange,
  placeholder = "Select...",
  ...rest
}: EnumInputProps) => {
  const { id, field, fieldState } = useInput({
    source,
    defaultValue,
    ...rest,
  });
  const translate = useTranslate();
  const i18nProvider = useI18nProvider() as I18nProvider;

  const choices = i18nProvider.getEnumValues(enumKey).map((value) => ({
    id: value.split(".").pop() ?? value,
    name: translate(`enum.${value}`),
  }));

  const handleValueChange = (value: string) => {
    field.onChange(value);
    onChange?.(value);
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
      <Select
        value={field.value ?? ""}
        onValueChange={handleValueChange}
        disabled={disabled || readOnly}
        placeholder={placeholder}
      >
        <SelectContent>
          {choices.map((choice) => (
            <SelectItem key={choice.id} value={choice.id}>
              {choice.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </BaseInput>
  );
};

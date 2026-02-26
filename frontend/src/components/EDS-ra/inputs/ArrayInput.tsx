import { Combobox } from "../../ui";
import { useInput } from "ra-core";
import { BaseInput, BaseInputProps } from "./BaseInput";

export type ArrayInputOption = {
  value: string;
  label: string;
};

export type ArrayInputProps = BaseInputProps & {
  options: ArrayInputOption[];
  defaultValue?: string[];
  placeholder?: string;
  format?: (value: any) => string[];
  parse?: (value: string[]) => any;
};

export const ArrayInput = ({
  source,
  required,
  tooltip,
  options,
  readOnly,
  disabled,
  defaultValue,
  placeholder,
  format,
  parse,
  ...rest
}: ArrayInputProps) => {
  const { id, field, fieldState } = useInput({
    source,
    defaultValue,
    format,
    parse,
    ...rest,
  });

  const selectedOptions = options.filter((option) =>
    (field.value as string[] | undefined)?.includes(option.value),
  );

  const handleToggle = (value: string, isSelected: boolean) => {
    const currentValues = (field.value as string[] | undefined) ?? [];
    if (isSelected) {
      field.onChange([...currentValues, value]);
    } else {
      field.onChange(currentValues.filter((v) => v !== value));
    }
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
      <Combobox
        options={options}
        selectedOptions={selectedOptions}
        onToggleSelected={handleToggle}
        isMultiSelect
        placeholder={placeholder}
        disabled={disabled || readOnly}
      />
    </BaseInput>
  );
};

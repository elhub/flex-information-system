import { CSSProperties } from "react";
import { Combobox } from "../../ui";
import { useInput } from "ra-core";
import { BaseInput, BaseInputProps } from "./BaseInput";

export type AutocompleteInputChoice = {
  id: string;
  name: string;
};

type AutocompleteInputProps = BaseInputProps & {
  choices: AutocompleteInputChoice[];
  defaultValue?: string;
  placeholder?: string;
  style?: CSSProperties;
};

export const AutocompleteInput = ({
  source,
  required,
  tooltip,
  choices,
  readOnly,
  disabled,
  defaultValue,
  placeholder,
  style,
  ...rest
}: AutocompleteInputProps) => {
  const { id, field, fieldState } = useInput({
    source,
    defaultValue,
    ...rest,
  });

  const options = choices.map((choice) => ({
    value: choice.id,
    label: choice.name,
  }));

  const selectedOption = options.find((option) => option.value === field.value);

  const handleToggle = (value: string, isSelected: boolean) =>
    field.onChange(isSelected ? value : null);

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
        style={style}
        options={options}
        selectedOptions={selectedOption ? [selectedOption] : []}
        onToggleSelected={handleToggle}
        placeholder={placeholder}
        disabled={disabled || readOnly}
      />
    </BaseInput>
  );
};

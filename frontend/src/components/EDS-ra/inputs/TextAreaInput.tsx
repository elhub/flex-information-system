import { Textarea } from "../../ui";
import { useInput } from "ra-core";
import { ChangeEvent } from "react";
import { BaseInput, BaseInputProps } from "./BaseInput";

type TextAreaInputProps = BaseInputProps & {
  placeholder?: string;
  rows?: number;
  maxLength?: number;
};

export const TextAreaInput = ({
  source,
  required,
  tooltip,
  placeholder,
  rows,
  maxLength,
  readOnly,
  disabled,
  ...rest
}: TextAreaInputProps) => {
  const { id, field, fieldState } = useInput({ source, ...rest });

  const handleChange = (e: ChangeEvent<HTMLTextAreaElement>) => {
    field.onChange(e.target.value);
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
      <Textarea
        id={id}
        value={field.value ?? ""}
        onChange={handleChange}
        onBlur={field.onBlur}
        placeholder={placeholder}
        rows={rows}
        maxLength={maxLength}
        readOnly={readOnly}
        disabled={disabled}
      />
    </BaseInput>
  );
};

import { TextField } from "../../ui";
import { useInput } from "ra-core";
import { ChangeEvent } from "react";
import { BaseInput, BaseInputProps } from "./BaseInput";

type TextInputProps = BaseInputProps & {
  type?: "text" | "email" | "password" | "number" | "tel" | "url";
  placeholder?: string;
};

export const TextInput = ({
  source,
  required,
  tooltip,
  type = "text",
  placeholder,
  readOnly,
  disabled,
  ...rest
}: TextInputProps) => {
  const { id, field, fieldState } = useInput({ source, ...rest });

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
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
      <TextField
        id={id}
        type={type}
        value={field.value ?? ""}
        onChange={handleChange}
        onBlur={field.onBlur}
        placeholder={placeholder}
        readOnly={readOnly}
        disabled={disabled}
      />
    </BaseInput>
  );
};

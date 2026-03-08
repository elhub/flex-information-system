import { useState, useId, ChangeEvent } from "react";
import { useInput } from "ra-core";
import { TextField, Select, SelectContent, SelectItem } from "../../ui";
import { BaseInput, BaseInputProps } from "./BaseInput";

export type UnitDefinition = {
  label: string;
  scale: number; // factor relative to the base unit (units[0])
};

type UnitInputProps = BaseInputProps & {
  units: UnitDefinition[];
  placeholder?: string;
};

export const UnitInput = ({
  source,
  required,
  tooltip,
  units,
  placeholder,
  readOnly,
  disabled,
  description,
  descriptionOverride,
  ...rest
}: UnitInputProps) => {
  const baseUnit = units[0];

  const [selectedUnitLabel, setSelectedUnitLabel] = useState(baseUnit.label);
  const [draftValue, setDraftValue] = useState<string | null>(null);
  const selectedUnit =
    units.find((u) => u.label === selectedUnitLabel) ?? baseUnit;

  const { id: inputId, field, fieldState } = useInput({ source, ...rest });
  const fallbackId = useId();
  const id = inputId || fallbackId;

  const displayValue =
    draftValue ??
    (field.value == null || field.value === ""
      ? ""
      : String(roundTo3(Number(field.value) / selectedUnit.scale)));

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value;
    setDraftValue(raw);

    const parsed = Number.parseFloat(raw);
    if (raw === "" || Number.isNaN(parsed)) {
      field.onChange(null);
    } else {
      field.onChange(roundTo3(parsed * selectedUnit.scale));
    }
  };

  const handleUnitChange = (newLabel: string) => {
    const newUnit = units.find((u) => u.label === newLabel) ?? baseUnit;
    if (newUnit.label === selectedUnit.label) {
      return;
    }

    if (draftValue != null) {
      const parsedDraft = Number.parseFloat(draftValue);
      if (!Number.isNaN(parsedDraft)) {
        const baseValue = roundTo3(parsedDraft * selectedUnit.scale);
        setDraftValue(String(roundTo3(baseValue / newUnit.scale)));
        field.onChange(baseValue);
      }
    }

    setSelectedUnitLabel(newUnit.label);
  };

  const handleBlur = () => {
    setDraftValue(null);
    field.onBlur();
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
      description={description}
      descriptionOverride={descriptionOverride}
    >
      <div className="flex items-center gap-2">
        <div className="flex-1">
          <TextField
            id={id}
            type="number"
            inputMode="decimal"
            step="0.1"
            min="0"
            value={displayValue}
            onChange={handleChange}
            onBlur={handleBlur}
            placeholder={placeholder}
            readOnly={readOnly}
            disabled={disabled}
          />
        </div>
        <Select
          value={selectedUnit.label}
          onValueChange={handleUnitChange}
          placeholder={selectedUnit.label}
          disabled={disabled || readOnly}
        >
          <SelectContent>
            {units.map((u) => (
              <SelectItem key={u.label} value={u.label}>
                {u.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </BaseInput>
  );
};

function roundTo3(n: number): number {
  return Math.round(n * 1000) / 1000;
}

import { Combobox } from "../../ui";
import {
  useChoicesContext,
  useGetRecordRepresentation,
  useInput,
  useResourceContext,
} from "ra-core";
import { BaseInput, BaseInputProps } from "./BaseInput";

type ReferenceComboboxInputProps = BaseInputProps & {
  fieldName?: string;
};

export const ReferenceComboboxInput = ({
  source,
  required,
  tooltip,
  fieldName,
  overrideLabel,
  readOnly,
  disabled,
  resource: resourceProp,
  ...rest
}: ReferenceComboboxInputProps) => {
  const { id, field, fieldState } = useInput({
    source,
    ...rest,
  });
  const { allChoices, isFetching, isLoading, setFilters, filterValues } =
    useChoicesContext();
  const resource = useResourceContext();
  const getRecordRepresentation = useGetRecordRepresentation(resource);

  const options = allChoices?.map((choice) => ({
    label: String(getRecordRepresentation(choice)),
    value: String(choice.id),
    id: choice.id,
  }));

  const selectedValue = options?.find(
    (option) => option.value === String(field.value),
  );

  const handleInputChange = (_event: unknown, value?: string) => {
    const filterKey = `${fieldName ?? "name"}@ilike`;
    setFilters({
      ...filterValues,
      [filterKey]: value ? `%${value}%` : undefined,
    });
  };

  const handleToggle = (value: string, isSelected: boolean) => {
    if (!isSelected) {
      field.onChange(null);
      return;
    }
    const next = options?.find((option) => option.value === value);
    field.onChange(next ? next.id : value);
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
      resource={resourceProp}
      overrideLabel={overrideLabel}
    >
      <Combobox
        options={options ?? []}
        selectedOptions={selectedValue ? [selectedValue] : []}
        onToggleSelected={handleToggle}
        isLoading={isFetching || isLoading}
        onChange={handleInputChange}
        disabled={disabled || readOnly}
      />
    </BaseInput>
  );
};

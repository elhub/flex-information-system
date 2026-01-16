import { Combobox, FormItem, FormItemLabel } from "../../ui";
import {
  InputProps,
  useChoicesContext,
  useGetRecordRepresentation,
  useInput,
  useResourceContext,
} from "ra-core";

type ReferenceComboboxInputProps = InputProps & {
  source: string;
  label?: string;
  fieldName?: string;
};

export const ReferenceComboboxInput = ({
  source,
  label,
  fieldName,
  ...rest
}: ReferenceComboboxInputProps) => {
  const { id, field } = useInput({ source, ...rest });
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
    <FormItem id={id}>
      {label ? <FormItemLabel htmlFor={id}>{label}</FormItemLabel> : null}
      <Combobox
        options={options ?? []}
        selectedOptions={selectedValue ? [selectedValue] : []}
        onToggleSelected={handleToggle}
        isLoading={isFetching || isLoading}
        onChange={handleInputChange}
      />
    </FormItem>
  );
};

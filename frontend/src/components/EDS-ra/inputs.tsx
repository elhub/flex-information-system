import { Combobox, FormItem, FormItemLabel } from "@elhub/ds-components";
import {
  InputProps,
  ReferenceInputBase,
  ReferenceInputBaseProps,
  useChoicesContext,
  useGetRecordRepresentation,
  useInput,
  useI18nProvider,
  useResourceContext,
  useTranslate,
} from "ra-core";
import { I18nProvider } from "../../intl/intl";

type EnumArrayInputProps = { enumKey: string } & InputProps;

export const EnumArrayInput = (props: EnumArrayInputProps) => {
  const { enumKey, label, source, ...rest } = props;
  const i18nProvider = useI18nProvider() as I18nProvider;
  const translate = useTranslate();
  const { id, field } = useInput({ source, ...rest });

  const options = i18nProvider.getEnumValues(enumKey).map((value) => ({
    value: value.split(".").pop() ?? value,
    label: translate(`enum.${value}`),
  }));

  const selectedValues = Array.isArray(field.value)
    ? field.value.map(String)
    : [];

  const selectedOptions = options.filter((option) =>
    selectedValues.includes(option.value),
  );

  const handleToggle = (value: string, isSelected: boolean) => {
    const nextValues = isSelected
      ? [...selectedValues, value]
      : selectedValues.filter((item) => item !== value);
    field.onChange(nextValues);
  };

  return (
    <FormItem id={id}>
      {label ? <FormItemLabel htmlFor={id}>{label}</FormItemLabel> : null}
      <Combobox
        options={options}
        isMultiSelect
        selectedOptions={selectedOptions}
        onToggleSelected={handleToggle}
        noResultsLabel={translate("ra.navigation.no_results", {
          _: "No results",
        })}
      />
    </FormItem>
  );
};

type AutocompleteReferenceInputProps = ReferenceInputBaseProps & {
  label?: string;
  fieldName?: string;
};

export const AutocompleteReferenceInput = (
  props: AutocompleteReferenceInputProps,
) => {
  const {
    label,
    fieldName,
    disabled,
    readOnly,
    validate,
    defaultValue,
    parse,
    format,
    name,
    perPage,
    ...rest
  } = props;
  return (
    <ReferenceInputBase perPage={perPage ?? 1000} {...rest}>
      <ReferenceComboboxInput
        source={props.source}
        label={label}
        disabled={disabled}
        readOnly={readOnly}
        validate={validate}
        defaultValue={defaultValue}
        parse={parse}
        format={format}
        name={name}
        fieldName={fieldName}
      />
    </ReferenceInputBase>
  );
};

type ReferenceComboboxInputProps = InputProps & {
  source: string;
  label?: string;
  fieldName?: string;
};

const ReferenceComboboxInput = ({
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

type PartyReferenceInputProps = Omit<
  AutocompleteReferenceInputProps,
  "reference"
> & {
  noTypeFilter?: boolean;
};

export const PartyReferenceInput = (props: PartyReferenceInputProps) => {
  const { source, noTypeFilter, filter, ...rest } = props;
  const choiceFilter =
    filter || (noTypeFilter ? undefined : { type: source.replace("_id", "") });

  return (
    <AutocompleteReferenceInput
      source={source}
      reference="party"
      filter={choiceFilter}
      {...rest}
    />
  );
};

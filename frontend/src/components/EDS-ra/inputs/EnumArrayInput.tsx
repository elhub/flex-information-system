import { Combobox, FormItem, FormItemLabel } from "../../ui";
import { InputProps, useInput, useI18nProvider, useTranslate } from "ra-core";
import { I18nProvider } from "../../../intl/intl";

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

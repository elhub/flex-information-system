import { useTranslate, useI18nProvider } from "ra-core";
import { I18nProvider } from "../../../intl/intl";
import { BaseInputProps } from "./BaseInput";
import { ArrayInput } from "./ArrayInput";

type EnumArrayInputProps = BaseInputProps & {
  enumKey: string;
  defaultValue?: string[];
  placeholder?: string;
};

export const EnumArrayInput = ({ enumKey, ...rest }: EnumArrayInputProps) => {
  const translate = useTranslate();
  const i18nProvider = useI18nProvider() as I18nProvider;

  const options = i18nProvider.getEnumValues(enumKey).map((value) => ({
    value: value.split(".").pop() ?? value,
    label: translate(`enum.${value}`),
  }));

  return <ArrayInput options={options} {...rest} />;
};

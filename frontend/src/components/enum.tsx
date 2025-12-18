import { Chip } from "@mui/material";
import {
  SelectArrayInput,
  SelectInput,
  useI18nProvider,
  useRecordContext,
  useTranslate,
} from "react-admin";
import { I18nProvider } from "../intl/intl";

export type EnumFieldProps = {
  source: string;
  label?: string; // used only for the header label in a Datagrid
  enumKey: string;
};

export const EnumField = ({ enumKey, source }: EnumFieldProps) => {
  const translate = useTranslate();
  const record = useRecordContext()!;

  return (
    <Chip
      label={translate(`enum.${enumKey}.${record[source]}`)}
      size="small"
      sx={{
        borderRadius: 2,
        fontWeight: 500,
      }}
    />
  );
};

export const EnumInput = (props: any) => {
  const i18nProvider = useI18nProvider() as I18nProvider;

  return (
    <SelectInput
      {...props}
      choices={i18nProvider.getEnumValues(props.enumKey).map((value) => ({
        id: value.split(".").pop(),
        name: `enum.${value}`,
      }))}
    />
  );
};

export const EnumArrayInput = (props: any) => {
  const i18nProvider = useI18nProvider() as I18nProvider;

  return (
    <SelectArrayInput
      {...props}
      choices={i18nProvider.getEnumValues(props.enumKey).map((value) => ({
        id: value.split(".").pop(),
        name: `enum.${value}`,
      }))}
    />
  );
};

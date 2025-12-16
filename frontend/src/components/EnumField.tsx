import { Chip } from "@mui/material";
import { useRecordContext, useTranslate } from "react-admin";

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

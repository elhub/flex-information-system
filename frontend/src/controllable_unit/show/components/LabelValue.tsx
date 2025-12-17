import { Box, Typography } from "@mui/material";
import { FieldLabel } from "../../../intl/field-labels";
import { useTranslateField } from "../../../intl/intl";

export const LabelValue = ({
  label,
  value,
  unit,
  labelKey,
}: {
  labelKey?: FieldLabel;
  label?: string;
  value: string | number | undefined;
  unit?: string;
}) => {
  const translateLabel = useTranslateField();
  if (!value) {
    return null;
  }

  return (
    <Box
      sx={{
        display: "flex",
        alignItems: "center",
        flexDirection: "row",
        gap: 1,
      }}
    >
      <Typography variant="subtitle1" color="text.secondary">
        {labelKey ? translateLabel(labelKey) : label}:
      </Typography>
      <Typography variant="body1" fontWeight="400" color="text.primary">
        {value} {unit}
      </Typography>
    </Box>
  );
};

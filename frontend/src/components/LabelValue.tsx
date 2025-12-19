import { Stack, Typography, TypographyProps } from "@mui/material";
import { FieldLabel } from "../intl/field-labels";
import { useTranslateField } from "../intl/intl";

type LabelValueProps = {
  labelKey?: FieldLabel;
  label?: string;
  value: string | number | undefined;
  unit?: string;
} & TypographyProps;

export const LabelValue = ({
  label,
  value,
  unit,
  labelKey,
  ...props
}: LabelValueProps) => {
  const translateLabel = useTranslateField();
  if (!value) {
    return null;
  }

  const formattedValue = unit ? `${value} ${unit}` : value;

  return (
    <Stack direction="row" spacing={1} alignItems="center">
      <Typography variant="subtitle1" color="text.secondary" {...props}>
        {labelKey ? translateLabel(labelKey) : label}:
      </Typography>
      <Typography
        variant="body1"
        fontWeight="400"
        color="text.primary"
        {...props}
      >
        {formattedValue}
      </Typography>
    </Stack>
  );
};

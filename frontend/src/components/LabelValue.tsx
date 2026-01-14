import { Stack, Typography, TypographyProps } from "@mui/material";
import { useTranslateField } from "../intl/intl";
import { FieldTooltip } from "../tooltip/FieldTooltip";
import { TooltipKey } from "../tooltip/tooltips";

type LabelValueProps = {
  labelKey?: TooltipKey;
  label?: string;
  value: string | number | undefined;
  unit?: string;
  tooltip?: boolean;
} & TypographyProps;

export const LabelValue = ({
  label,
  value,
  unit,
  labelKey,
  tooltip = false,
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
      {tooltip && labelKey && <FieldTooltip tooltipKey={labelKey} />}
    </Stack>
  );
};

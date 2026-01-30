import { Stack, TypographyProps } from "@mui/material";
import { useTranslateField } from "../intl/intl";
import { FieldTooltip } from "../tooltip/FieldTooltip";
import { TooltipKey } from "../tooltip/tooltips";
import { FieldLabel } from "../intl/field-labels";
import { BodyText } from "./ui";

type LabelValueProps = {
  labelKey?: TooltipKey | FieldLabel;
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
      <BodyText weight="bold" {...props}>
        {labelKey ? translateLabel(labelKey) : label}:
      </BodyText>
      <BodyText {...props}>{formattedValue}</BodyText>
      {tooltip && labelKey && <FieldTooltip tooltipKey={labelKey} />}
    </Stack>
  );
};

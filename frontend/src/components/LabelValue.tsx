import { useTranslateField } from "../intl/intl";
import { FieldTooltip } from "../tooltip/FieldTooltip";
import { TooltipKey } from "../tooltip/tooltips";
import { FieldLabel } from "../intl/field-labels";
import { BodyText, BodyTextProps } from "./ui";

type LabelValueProps = {
  labelKey?: TooltipKey | FieldLabel;
  label?: string;
  value: string | number | undefined;
  unit?: string;
  tooltip?: boolean;
} & Omit<BodyTextProps, "children">;

export const LabelValue = ({
  label,
  value,
  unit,
  labelKey,
  tooltip = false,
  ...props
}: LabelValueProps) => {
  const translateLabel = useTranslateField();

  const formattedValue = value
    ? unit
      ? `${value} ${unit}`
      : value
    : "No value";

  return (
    <div className="flex gap-2 items-center">
      <BodyText weight="bold" {...props}>
        {labelKey ? translateLabel(labelKey) : label}:
      </BodyText>
      <BodyText {...props}>{formattedValue} </BodyText>
      {tooltip && labelKey && <FieldTooltip tooltipKey={labelKey} />}
    </div>
  );
};

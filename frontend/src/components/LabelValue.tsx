import { useTranslateField } from "../intl/intl";
import { FieldTooltip } from "../tooltip/FieldTooltip";
import { TooltipKey } from "../tooltip/tooltips";
import { FieldLabel } from "../intl/field-labels";
import { BodyText, BodyTextProps, Link } from "./ui";
import { ReactNode } from "react";
import { Link as RouterLink } from "react-router-dom";
import { cn } from "../util";

type LabelValueProps = {
  labelKey?: TooltipKey | FieldLabel;
  label?: string;
  value: string | number | ReactNode | undefined;
  link?: string;
  linkText?: string;
  unit?: string;
  tooltip?: boolean;
  className?: string;
} & Omit<BodyTextProps, "children">;

export const LabelValue = ({
  label,
  value,
  unit,
  labelKey,
  tooltip = false,
  link,
  linkText,
  className,
  ...props
}: LabelValueProps) => {
  const translateLabel = useTranslateField();

  const formattedValue = value
    ? unit
      ? `${value} ${unit}`
      : value
    : "No value";

  return (
    <div className={cn("contents", className)}>
      <BodyText weight="bold" {...props}>
        {labelKey ? translateLabel(labelKey) : label}:
      </BodyText>
      <div className="flex gap-2 items-center">
        <BodyText {...props}>{formattedValue}</BodyText>
        {link && linkText && (
          <Link to={link} as={RouterLink}>
            {linkText}
          </Link>
        )}
        {tooltip && labelKey && <FieldTooltip tooltipKey={labelKey} />}
      </div>
    </div>
  );
};

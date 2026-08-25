import { useTranslateField } from "../intl/intl";
import { FieldTooltip } from "../tooltip/FieldTooltip";
import { TooltipKey } from "../tooltip/tooltips";
import { FieldLabel } from "../intl/field-labels";
import { BodyText, BodyTextProps, Link } from "./ui";
import { ReactNode } from "react";
import { Link as RouterLink } from "react-router-dom";
import { cn } from "../util";
import { convertScale, IDENTITY, Scale } from "../utils/scales";

type LabelValueProps = {
  labelKey?: TooltipKey | FieldLabel;
  label?: string;
  value: string | number | ReactNode | undefined;
  link?: string;
  linkText?: string;
  unit?: string;
  storageScale?: Scale;
  displayScale?: Scale;
  tooltip?: boolean;
  className?: string;
} & Omit<BodyTextProps, "children">;

export const LabelValue = ({
  label,
  value,
  unit,
  storageScale = IDENTITY,
  displayScale = storageScale,
  labelKey,
  tooltip = false,
  link,
  linkText,
  className,
  ...props
}: LabelValueProps) => {
  const translateLabel = useTranslateField();

  const scaledValue =
    typeof value === "number"
      ? convertScale(value, storageScale, displayScale)
      : value;

  const unitLabel = unit ? `${displayScale.prefix}${unit}` : undefined;

  const formattedValue =
    scaledValue !== undefined && scaledValue !== null && scaledValue !== ""
      ? unitLabel &&
        (typeof scaledValue === "string" || typeof scaledValue === "number")
        ? `${scaledValue} ${unitLabel}`
        : scaledValue
      : "No value";

  return (
    <div className={cn("flex flex-col gap-1", className)}>
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

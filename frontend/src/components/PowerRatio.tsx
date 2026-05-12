import { ReactNode } from "react";
import { Tag, Tooltip } from "./ui";

type TagVariant = "success" | "warning" | "error";

// tag variant based on the ratio of flexible power to rated power
const getPowerRatioVariant = (
  flexiblePower: number,
  ratedPower: number,
): TagVariant => {
  if (ratedPower <= 0) return "success";
  const ratio = flexiblePower / ratedPower;
  // OK if under 80%, risky if under 100%, critical if above
  if (ratio <= 0.8) return "success";
  if (ratio <= 1) return "warning";
  return "error";
};

// render a power ratio as a percentage inside a colored Tag.
export const PowerRatio = ({
  flexiblePower,
  ratedPower,
}: {
  flexiblePower: number | undefined;
  ratedPower: number | undefined;
}): ReactNode => {
  if (ratedPower == null || ratedPower <= 0 || flexiblePower == null) {
    return "—";
  }
  const ratio = flexiblePower / ratedPower;
  const percentage = (ratio * 100).toFixed(1);
  const variant = getPowerRatioVariant(flexiblePower, ratedPower);
  return (
    <Tooltip
      content={`The flexible power represents ${percentage}% of the rated power. This ratio should ideally be held under 80% to ensure delivery capability.`}
    >
      <Tag size="small" variant={variant}>
        {percentage}%
      </Tag>
    </Tooltip>
  );
};

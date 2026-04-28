import { ReactNode } from "react";

// semantic color class based on the ratio of flexible power to rated power
const getPowerRatioColorClass = (
  flexiblePower: number,
  ratedPower: number,
): string => {
  if (ratedPower <= 0) return "";
  const ratio = flexiblePower / ratedPower;
  // OK if under 80%, risky if under 100%, critical if above
  if (ratio <= 0.8) return "text-semantic-text-success";
  if (ratio <= 1) return "text-semantic-text-warning";
  return "text-semantic-text-error";
};

// render a formatted power ratio as a percentage with semantic coloring
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
  const colorClass = getPowerRatioColorClass(flexiblePower, ratedPower);
  return <span className={colorClass}>{percentage}%</span>;
};

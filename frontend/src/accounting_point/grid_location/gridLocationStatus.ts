import { IconCheckCircle, IconWarningCircle } from "@elhub/ds-icons";
import { AccountingPointGridLocationQuality } from "../../generated-client";
import { StatusVariant } from "../../components/StatusBadge";

export const gridLocationQualityVariant = (
  quality: AccountingPointGridLocationQuality | undefined | null,
): StatusVariant => {
  if (!quality) {
    return { status: "failed", icon: IconWarningCircle };
  }
  return quality.toLowerCase() === "confirmed"
    ? { status: "approved", icon: IconCheckCircle }
    : { status: "approved-with-warning", icon: IconWarningCircle };
};

import { ComponentType } from "react";
import {
  IconCheckCircle,
  IconCrossCircle,
  IconStopWatch15,
  IconWarningCircle,
  SvgIconProps,
} from "@elhub/ds-icons";
import { ServiceProviderProductApplicationStatus } from "../../generated-client";

export type SppaBadgeVariant = {
  status:
    | "ongoing"
    | "failed"
    | "approved-with-warning"
    | "approved"
    | "stopped"
    | "temporarily-stopped"
    | "pending"
    | "rejected";
  icon: ComponentType<SvgIconProps>;
};

export const sppaStatusVariantMap: Record<
  ServiceProviderProductApplicationStatus,
  SppaBadgeVariant
> = {
  requested: { status: "pending", icon: IconStopWatch15 },
  in_progress: { status: "ongoing", icon: IconStopWatch15 },
  communication_test: { status: "ongoing", icon: IconWarningCircle },
  not_qualified: { status: "rejected", icon: IconCrossCircle },
  qualified: { status: "approved", icon: IconCheckCircle },
};

import { ComponentType } from "react";
import {
  IconCrossCircle,
  IconQualitiesCircle,
  IconStopWatch15,
  IconWarningCircle,
  SvgIconProps,
} from "@elhub/ds-icons";
import { ServiceProvidingGroupProductApplicationStatus } from "../../../generated-client";

export type SpgpaBadgeVariant = {
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

export const spgpaStatusVariantMap: Record<
  ServiceProvidingGroupProductApplicationStatus,
  SpgpaBadgeVariant
> = {
  requested: { status: "pending", icon: IconStopWatch15 },
  prequalification_pending: { status: "ongoing", icon: IconStopWatch15 },
  in_progress: { status: "ongoing", icon: IconStopWatch15 },
  temporary_qualified: {
    status: "approved-with-warning",
    icon: IconWarningCircle,
  },
  prequalified: { status: "approved", icon: IconQualitiesCircle },
  verified: { status: "approved", icon: IconQualitiesCircle },
  rejected: { status: "rejected", icon: IconCrossCircle },
};

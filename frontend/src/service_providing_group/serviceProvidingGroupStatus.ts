import { ComponentType } from "react";
import {
  IconCross,
  IconCrossCircle,
  IconQualitiesCircle,
  IconStopWatch15,
  SvgIconProps,
} from "@elhub/ds-icons";
import { ServiceProvidingGroupStatus } from "../generated-client";

export type SpgBadgeVariant = {
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

export const spgStatusVariantMap: Record<
  ServiceProvidingGroupStatus,
  SpgBadgeVariant
> = {
  new: { status: "ongoing", icon: IconStopWatch15 },
  active: { status: "approved", icon: IconQualitiesCircle },
  inactive: { status: "stopped", icon: IconCross },
  terminated: { status: "rejected", icon: IconCrossCircle },
};

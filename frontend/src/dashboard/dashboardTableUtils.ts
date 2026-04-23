// frontend/src/dashboard/dashboardTableUtils.ts
import { ComponentType } from "react";
import {
  IconCheckCircle,
  IconCrossCircle,
  IconStopWatch15,
  IconWarningCircle,
  SvgIconProps,
} from "@elhub/ds-icons";
import {
  sppaStatusVariantMap,
  SppaBadgeVariant,
} from "../service_provider_product_application/show/sppaStatus";
import { spgpaStatusVariantMap } from "../service_providing_group/product_application/show/spgpaStatus";
import { DashboardItemKind } from "./useDashboardApplications";

export type BadgeVariant = {
  status: SppaBadgeVariant["status"];
  icon: ComponentType<SvgIconProps>;
};

export const ENUM_KEY_PREFIX: Record<DashboardItemKind, string> = {
  sp_product_application: "service_provider_product_application.status",
  spg_product_application: "service_providing_group_product_application.status",
  spg_grid_prequalification:
    "service_providing_group_grid_prequalification.status",
};

// Grid prequalification statuses don't have a shared variant map yet,
// so we define a minimal one inline.
export const spggpStatusVariantMap: Record<string, BadgeVariant> = {
  requested: { status: "pending", icon: IconStopWatch15 },
  in_progress: { status: "ongoing", icon: IconStopWatch15 },
  conditionally_approved: {
    status: "approved-with-warning",
    icon: IconWarningCircle,
  },
  approved: { status: "approved", icon: IconCheckCircle },
  not_approved: { status: "rejected", icon: IconCrossCircle },
};

export const fallbackVariant: BadgeVariant = {
  status: "pending",
  icon: IconStopWatch15,
};

export const getStatusVariant = (
  kind: DashboardItemKind,
  status: string,
): BadgeVariant => {
  if (kind === "sp_product_application") {
    return (
      sppaStatusVariantMap[status as keyof typeof sppaStatusVariantMap] ??
      fallbackVariant
    );
  }
  if (kind === "spg_product_application") {
    return (
      spgpaStatusVariantMap[status as keyof typeof spgpaStatusVariantMap] ??
      fallbackVariant
    );
  }
  return spggpStatusVariantMap[status] ?? fallbackVariant;
};

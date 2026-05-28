import { IconStopWatch15 } from "@elhub/ds-icons";
import { sppaStatusVariantMap } from "../../service_provider_product_application/show/sppaStatus";
import { StatusVariant } from "../../components/EDS-ra/fields/StatusBadgeField";
import { spgpaStatusVariantMap } from "../../service_providing_group/product_application/show/spgpaStatus";
import { DashboardItemKind } from "../hooks/useDashboardApplications";
import { spgpqStatusVariantMap } from "../../service_providing_group/grid_prequalification/show/spgpqStatus";

export type BadgeVariant = StatusVariant;

export const ENUM_KEY_PREFIX: Record<DashboardItemKind, string> = {
  sp_product_application: "service_provider_product_application.status",
  spg_product_application: "service_providing_group_product_application.status",
  spg_grid_prequalification:
    "service_providing_group_grid_prequalification.status",
};

export const fallbackVariant: BadgeVariant = {
  status: "ongoing",
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
  return (
    spgpqStatusVariantMap[status as keyof typeof spgpqStatusVariantMap] ??
    fallbackVariant
  );
};

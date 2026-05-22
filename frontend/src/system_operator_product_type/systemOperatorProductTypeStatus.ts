import {
  IconCross,
  IconQualitiesCircle,
} from "@elhub/ds-icons";
import { SystemOperatorProductTypeStatus } from "../generated-client";
import { StatusVariant } from "../components/EDS-ra/fields/StatusBadgeField";

export const soProductTypeStatusVariantMap: Record<
  SystemOperatorProductTypeStatus,
  StatusVariant
> = {
  active:   { status: "approved",            icon: IconQualitiesCircle },
  inactive: { status: "temporarily-stopped", icon: IconCross           },
};

import {
  IconCross,
  IconCrossCircle,
  IconQualitiesCircle,
  IconStopWatch15,
} from "@elhub/ds-icons";
import { ServiceProvidingGroupStatus } from "../generated-client";
import { StatusVariant } from "../components/EDS-ra/fields/StatusBadgeField";

export const spgStatusVariantMap: Record<
  ServiceProvidingGroupStatus,
  StatusVariant
> = {
  new: { status: "ongoing", icon: IconStopWatch15 },
  active: { status: "approved", icon: IconQualitiesCircle },
  inactive: { status: "temporarily-stopped", icon: IconCross },
  terminated: { status: "stopped", icon: IconCrossCircle },
};

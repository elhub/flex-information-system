import {
  IconCrossCircle,
  IconPencil,
  IconQualitiesCircle,
  IconStopWatch15,
  IconWarningCircle,
} from "@elhub/ds-icons";
import { ServiceProvidingGroupProductApplicationStatus } from "../../generated-client";
import { StatusVariant } from "../../components/EDS-ra/fields/StatusBadgeField";

export const DRAFT_STATUS = "draft";

export const spgpaStatusVariantMap: Record<
  ServiceProvidingGroupProductApplicationStatus | typeof DRAFT_STATUS,
  StatusVariant
> = {
  requested: { status: "ongoing", icon: IconStopWatch15 },
  prequalification: { status: "ongoing", icon: IconStopWatch15 },
  temporary_qualified: {
    status: "approved-with-warning",
    icon: IconWarningCircle,
  },
  prequalified: { status: "approved", icon: IconQualitiesCircle },
  verified: { status: "approved", icon: IconQualitiesCircle },
  rejected: { status: "failed", icon: IconCrossCircle },
  draft: { status: "stopped", icon: IconPencil },
};

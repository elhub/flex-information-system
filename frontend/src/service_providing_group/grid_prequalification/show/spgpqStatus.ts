import {
  IconCrossCircle,
  IconQualitiesCircle,
  IconStopWatch15,
  IconWarningCircle,
} from "@elhub/ds-icons";
import { ServiceProvidingGroupGridPrequalificationStatus } from "../../../generated-client";
import { StatusVariant } from "../../../components/EDS-ra/fields/StatusBadgeField";

export const spgpqStatusVariantMap: Record<
  ServiceProvidingGroupGridPrequalificationStatus,
  StatusVariant
> = {
  requested:              { status: "ongoing",               icon: IconStopWatch15    },
  in_progress:            { status: "ongoing",               icon: IconStopWatch15    },
  conditionally_approved: { status: "approved-with-warning", icon: IconWarningCircle  },
  approved:               { status: "approved",              icon: IconQualitiesCircle },
  not_approved:           { status: "failed",                icon: IconCrossCircle    },
};

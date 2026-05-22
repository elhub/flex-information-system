import { ComponentType } from "react";
import {
  IconCheckCircle,
  IconCrossCircle,
  IconStopWatch15,
  IconWarningCircle,
  SvgIconProps,
} from "@elhub/ds-icons";
import { ServiceProviderProductApplicationStatus } from "../../generated-client";
import { StatusVariant } from "../../components/EDS-ra/fields/StatusBadgeField";

export const sppaStatusVariantMap: Record<
  ServiceProviderProductApplicationStatus,
  StatusVariant
> = {
  requested:         { status: "ongoing",  icon: IconStopWatch15   },
  in_progress:       { status: "ongoing",  icon: IconStopWatch15   },
  communication_test:{ status: "ongoing",  icon: IconWarningCircle },
  not_qualified:     { status: "failed",   icon: IconCrossCircle   },
  qualified:         { status: "approved", icon: IconCheckCircle   },
};

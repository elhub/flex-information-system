import {
  IconCross,
  IconCrossCircle,
  IconQualitiesCircle,
  IconStopWatch15,
  IconWarningCircle,
} from "@elhub/ds-icons";
import { PartyStatus } from "../generated-client";
import { StatusVariant } from "../components/EDS-ra/fields/StatusBadgeField";

export const partyStatusVariantMap: Record<PartyStatus, StatusVariant> = {
  new:        { status: "ongoing",               icon: IconStopWatch15     },
  active:     { status: "approved",              icon: IconQualitiesCircle },
  inactive:   { status: "temporarily-stopped",   icon: IconCross           },
  suspended:  { status: "approved-with-warning", icon: IconWarningCircle   },
  terminated: { status: "stopped",               icon: IconCrossCircle     },
};

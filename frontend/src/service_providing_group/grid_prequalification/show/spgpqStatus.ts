import { ComponentType } from "react";
import {
    IconCrossCircle,
    IconQualitiesCircle,
    IconStopWatch15,
    IconWarningCircle,
    SvgIconProps,
} from "@elhub/ds-icons";
import { ServiceProvidingGroupGridPrequalificationStatus } from "../../../generated-client";

export type SpgpqBadgeVariant = {
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

export const spgpqStatusVariantMap: Record<
    ServiceProvidingGroupGridPrequalificationStatus,
    SpgpqBadgeVariant
> = {
    requested: { status: "pending", icon: IconStopWatch15 },
    in_progress: { status: "ongoing", icon: IconStopWatch15 },
    conditionally_approved: {
        status: "approved-with-warning",
        icon: IconWarningCircle,
    },
    approved: { status: "approved", icon: IconQualitiesCircle },
    not_approved: { status: "rejected", icon: IconCrossCircle },
};

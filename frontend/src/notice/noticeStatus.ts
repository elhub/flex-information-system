import {
  IconCheckCircle,
  IconQualitiesCircle,
} from "@elhub/ds-icons";
import { NoticeStatus } from "../generated-client";
import { StatusVariant } from "../components/EDS-ra/fields/StatusBadgeField";

export const noticeStatusVariantMap: Record<NoticeStatus, StatusVariant> = {
  active:   { status: "approved", icon: IconQualitiesCircle },
  resolved: { status: "approved", icon: IconCheckCircle     },
};

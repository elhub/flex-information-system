import { useMemo } from "react";
import { useTranslate } from "ra-core";
import { useTranslateField } from "../../../intl/intl";
import { ServiceProvidingGroupProductApplication } from "../../../generated-client";
import type { TimelineMark } from "../../../components/ui";
import {
  useTimelineMarks,
  type TimelineMilestone,
} from "../../shared/changes/timelineUtils";

// The SPGPA's lifecycle milestones plus "now".
export const useSpgpaMilestones = (
  spgpa: ServiceProvidingGroupProductApplication,
  now: string,
): TimelineMilestone[] => {
  const translate = useTranslate();
  const translateField = useTranslateField();

  return useMemo(
    () => [
      {
        at: spgpa.created_at,
        label: translateField(
          "service_providing_group_product_application.created_at",
        ),
      },
      {
        at: spgpa.prequalified_at,
        label: translateField(
          "service_providing_group_product_application.prequalified_at",
        ),
      },
      {
        at: spgpa.verified_at,
        label: translateField(
          "service_providing_group_product_application.verified_at",
        ),
      },
      {
        at: spgpa.complete_at,
        label: translateField(
          "service_providing_group_product_application.complete_at",
        ),
      },
      { at: now, label: translate("text.spg_changes_milestone_now") },
    ],
    [spgpa, now, translate, translateField],
  );
};

// Builds the timeline marks for the SPGPA's lifecycle milestones (skipping
// any that are unset) plus "now", each labeled and formatted for display.
export const useSpgpaTimelineMarks = (
  spgpa: ServiceProvidingGroupProductApplication,
  now: string,
): TimelineMark[] => useTimelineMarks(useSpgpaMilestones(spgpa, now));

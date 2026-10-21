import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { useTranslate } from "ra-core";
import {
  listServiceProvidingGroupGridPrequalificationHistory,
  ServiceProvidingGroupGridPrequalification,
} from "../../../generated-client";
import { throwOnError } from "../../../util";
import type { TimelineMilestone } from "../../shared/changes/timelineUtils";

// The time the SPG-GP was created: the oldest record in its history. Falls back
// to the recorded time of the current version if the history is not available.
const useSpgpqCreatedAt = (
  spgpq: ServiceProvidingGroupGridPrequalification,
) => {
  const { data } = useQuery({
    queryKey: ["spgpq_created_at", spgpq.id],
    queryFn: () =>
      listServiceProvidingGroupGridPrequalificationHistory({
        query: {
          service_providing_group_grid_prequalification_id: `eq.${spgpq.id}`,
          order: "recorded_at.asc",
          limit: "1",
        },
      }).then(throwOnError),
    retry: false,
  });
  return data?.[0]?.recorded_at ?? spgpq.recorded_at;
};

// The SPG-GP's lifecycle milestones plus "now". Unset milestones (e.g. when the
// SPG-GP has not been approved) are left out by the timeline.
export const useSpgpqMilestones = (
  spgpq: ServiceProvidingGroupGridPrequalification,
  now: string,
): TimelineMilestone[] => {
  const translate = useTranslate();
  const createdAt = useSpgpqCreatedAt(spgpq);

  return useMemo(
    () => [
      {
        at: createdAt,
        label: translate("text.spgpq_changes_milestone_created"),
      },
      {
        at: spgpq.prequalified_at ?? undefined,
        label: translate("text.spgpq_changes_milestone_approved"),
      },
      { at: now, label: translate("text.spg_changes_milestone_now") },
    ],
    [createdAt, spgpq.prequalified_at, now, translate],
  );
};

import { useState } from "react";
import { ServiceProvidingGroupProductApplication } from "../../../generated-client";
import { Scale } from "../../../utils/scales";
import { SpgChangesView } from "../../shared/changes/SpgChangesView";
import { useSpgpaMilestones } from "./useSpgpaMilestones";

// Changes tab for a SPGPA, with the SPGPA's lifecycle milestones on the timeline.
export const SpgpaChangesTab = ({
  spgId,
  spgpa,
  powerScale,
}: {
  spgId: number;
  spgpa: ServiceProvidingGroupProductApplication;
  powerScale: Scale;
}) => {
  const [now] = useState(() => new Date().toISOString());
  const milestones = useSpgpaMilestones(spgpa, now);

  return (
    <SpgChangesView
      spgId={spgId}
      milestones={milestones}
      fallbackFrom={spgpa.created_at}
      now={now}
      powerScale={powerScale}
    />
  );
};

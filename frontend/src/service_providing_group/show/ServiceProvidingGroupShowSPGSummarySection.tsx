import { Link, Panel } from "../../components/ui";

import type { ServiceProvidingGroupSummary } from "../../generated-client";
import { SpgShowViewModel } from "./useSpgShowViewModel";
import { ServiceProvidingGroupControllableUnitSummary } from "../summary/ServiceProvidingGroupControllableUnitSummary";
import { ServiceProvidingGroupTechnicalResourceSummary } from "../summary/ServiceProvidingGroupTechnicalResourceSummary";

type Props = {
  spgViewModel: SpgShowViewModel;
  summary: ServiceProvidingGroupSummary;
};

export const ServiceProvidingGroupShowSPGSummarySection = ({
  spgViewModel,
  summary,
}: Props) => {
  return (
    <div className="flex flex-col gap-4">
      <Panel border className="h-fit p-4 sm:p-5 flex flex-col gap-4">
        <p>
          A service providing group is composed of controllable units,
          themselves composed of technical resources. Technical resources are
          registered with a <b>rated power</b> corresponding to their physical
          ability to deliver an effect on the grid, while controllable units are
          registered with a <b>flexible power</b> corresponding to the fraction
          of the total rated power of their technical resources that is to be
          proposed as a flexibility product on the market. More details are
          available in the{" "}
          <Link
            external
            href="https://elhub.github.io/flex-information-system/concepts/technologies"
          >
            documentation of the Flexibility Information System
          </Link>
          {" ."}
        </p>
      </Panel>
      <ServiceProvidingGroupControllableUnitSummary
        spgViewModel={spgViewModel}
        summary={summary}
      />
      <ServiceProvidingGroupTechnicalResourceSummary
        summary={summary}
        showDetails
      />
    </div>
  );
};

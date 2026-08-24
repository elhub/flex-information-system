import { Loader, Link, Panel } from "../../../components/ui";
import { LabelValue } from "../../../components/LabelValue";
import { Link as RouterLink } from "react-router-dom";
import { ServiceProvidingGroup } from "../../../generated-client";
import { ServiceProvidingGroupControllableUnitSummary } from "../../summary/ServiceProvidingGroupControllableUnitSummary";
import { ServiceProvidingGroupTechnicalResourceSummary } from "../../summary/ServiceProvidingGroupTechnicalResourceSummary";
import { KILO, Scale } from "../../../utils/scales";

type Props = {
  spgId: number;
  spg: ServiceProvidingGroup | undefined;
  powerScale?: Scale;
};

export const SpgInfoTab = ({
  spgId: _spgId,
  spg,
  powerScale = KILO,
}: Props) => {
  if (!spg) {
    return <Loader size="small" />;
  }

  return (
    <div className="flex flex-col gap-4">
      <Panel border className="flex flex-col gap-4 p-4">
        <LabelValue
          label="Name"
          value={
            <div className="flex items-center gap-2">
              {spg.name}
              <Link
                as={RouterLink}
                to={`/service_providing_group/${spg.id}/show`}
              >
                See more
              </Link>
            </div>
          }
        />
        <LabelValue label="Bidding zone" value={spg.bidding_zone} />
      </Panel>
      {spg.summary && (
        <>
          <ServiceProvidingGroupControllableUnitSummary
            summary={spg.summary}
            displayScale={powerScale}
          />
          <ServiceProvidingGroupTechnicalResourceSummary
            summary={spg.summary}
            displayScale={powerScale}
          />
        </>
      )}
    </div>
  );
};

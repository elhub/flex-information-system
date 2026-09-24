import { Link as RouterLink } from "react-router-dom";
import { Link, Loader, Panel } from "../../../components/ui";
import { ServiceProvidingGroup } from "../../../generated-client";
import { ServiceProvidingGroupControllableUnitSummary } from "../../summary/ServiceProvidingGroupControllableUnitSummary";
import { ServiceProvidingGroupTechnicalResourceSummary } from "../../summary/ServiceProvidingGroupTechnicalResourceSummary";
import { KILO, Scale } from "../../../utils/scales";
import { LabelValue } from "../../../components/LabelValue";
import { useParty } from "../../../hooks/party";
import { IconRight } from "@elhub/ds-icons";

type Props = {
  spgId: number;
  spgProcuringSystemOperatorId?: number;
  spg: ServiceProvidingGroup | undefined;
  powerScale?: Scale;
};

export const SpgInfoTab = ({
  spgId,
  spgProcuringSystemOperatorId,
  spg,
  powerScale = KILO,
}: Props) => {
  const procuringServiceProvider = useParty(spgProcuringSystemOperatorId);

  if (procuringServiceProvider.error) throw procuringServiceProvider.error;

  if (!spg) {
    return <Loader size="small" />;
  }

  return (
    <div className="flex flex-col gap-4">
      <Panel border className="p-4 sm:p-5">
        <div className="grid gap-5 sm:grid-cols-2">
          <LabelValue
            label="Service providing group"
            value={
              <Link
                as={RouterLink}
                to={`/service_providing_group/${spgId}/show`}
                className="inline-flex items-center gap-1"
                title="View service providing group"
              >
                {spg.name} (#{spg.id})
                <IconRight size="small" />
              </Link>
            }
          />
          {spgProcuringSystemOperatorId && (
            <LabelValue
              label="System operator / PSO"
              value={
                <Link
                  as={RouterLink}
                  to={`/party/${spgProcuringSystemOperatorId}/show`}
                  className="inline-flex items-center gap-1"
                  title="View system operator / PSO"
                >
                  {procuringServiceProvider.data?.name}
                  <IconRight size="small" />
                </Link>
              }
            />
          )}
        </div>
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

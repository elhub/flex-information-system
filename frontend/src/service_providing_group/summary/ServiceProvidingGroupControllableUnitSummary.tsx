import { Heading, Panel } from "../../components/ui";
import { ServiceProvidingGroupSummary } from "../../generated-client";
import { LabelValue } from "../../components/LabelValue";
import { SpgShowViewModel } from "../show/useSpgShowViewModel";

type Props = {
  spgViewModel: SpgShowViewModel;
  summary: ServiceProvidingGroupSummary;
};

export const ServiceProvidingGroupControllableUnitSummary = ({
  spgViewModel,
  summary,
}: Props) => {
  const cu = summary.controllable_unit;

  return (
    <Panel border className="h-fit p-4 sm:p-5 flex flex-col gap-4">
      <Heading size="large">Controllable units summary</Heading>
      <p>
        This service providing group contains <b>{cu.count ?? 0}</b>{" "}
        controllable units. Here are the aggregates computed across all of them,
        taking into account all technical resources they contain:
      </p>
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <LabelValue
          label="Aggregated rated power"
          value={cu.maximum_active_power?.sum ?? 0}
          unit="kW"
        />
        <LabelValue
          label="Average rated power"
          value={
            cu.maximum_active_power?.average
              ? Math.round(cu.maximum_active_power.average * 100) / 100
              : 0
          }
          unit="kW"
        />
        <LabelValue
          label="Minimum rated power"
          value={cu.maximum_active_power?.min ?? 0}
          unit="kW"
        />
        <LabelValue
          label="Maximum rated power"
          value={cu.maximum_active_power?.max ?? 0}
          unit="kW"
        />
      </div>
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <LabelValue
          label="Aggregated flexible power"
          value={spgViewModel.totalCapacityKw}
          unit="kW"
        />
        <LabelValue
          label="Aggregated flexible power (consumption)"
          value={spgViewModel.consumptionCapacityKw}
          unit="kW"
        />
        <LabelValue
          label="Aggregated flexible power (production)"
          value={spgViewModel.productionCapacityKw}
          unit="kW"
        />
      </div>
    </Panel>
  );
};

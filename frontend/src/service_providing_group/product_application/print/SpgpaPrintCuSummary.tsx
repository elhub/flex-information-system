import { Heading } from "../../../components/ui";
import { LabelValue } from "../../../components/LabelValue";
import type { ServiceProvidingGroupSummary } from "../../../generated-client";
import type { SpgShowViewModel } from "../../show/useSpgShowViewModel";

type Props = {
  spgViewModel: SpgShowViewModel;
  summary: ServiceProvidingGroupSummary;
};

export const SpgpaPrintCuSummary = ({ spgViewModel, summary }: Props) => {
  const cu = summary.controllable_unit;

  return (
    <div className="flex flex-col gap-4">
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
          label="Aggregated flexible power (down)"
          value={spgViewModel.consumptionCapacityKw}
          unit="kW"
        />
        <LabelValue
          label="Aggregated flexible power (up)"
          value={spgViewModel.productionCapacityKw}
          unit="kW"
        />
      </div>
    </div>
  );
};

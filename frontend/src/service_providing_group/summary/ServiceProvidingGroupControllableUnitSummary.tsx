import { Heading, Panel } from "../../components/ui";
import { ServiceProvidingGroupSummary } from "../../generated-client";
import { LabelValue } from "../../components/LabelValue";
import { PowerRatio } from "../../components/PowerRatio";

type Props = {
  summary: ServiceProvidingGroupSummary;
};

export const ServiceProvidingGroupControllableUnitSummary = ({
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
          value={summary.technical_resource.maximum_active_power?.sum ?? 0}
          unit="kW"
        />
        <LabelValue
          label="Aggregated flexible power"
          value={
            <span className="inline-flex items-center gap-3">
              <span>{cu.maximum_active_power?.sum ?? 0} kW</span>
              <PowerRatio
                flexiblePower={cu.maximum_active_power?.sum}
                ratedPower={
                  summary.technical_resource.maximum_active_power?.sum
                }
              />
            </span>
          }
        />
        <LabelValue
          label="Aggregated flexible power (down)"
          value={cu.maximum_active_power_down?.sum ?? 0}
          unit="kW"
        />
        <LabelValue
          label="Aggregated flexible power (up)"
          value={cu.maximum_active_power_up?.sum ?? 0}
          unit="kW"
        />
      </div>
    </Panel>
  );
};

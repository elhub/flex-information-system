import { Heading } from "../../../components/ui";
import { LabelValue } from "../../../components/LabelValue";
import { KILO } from "../../../utils/scales";
import type { ServiceProvidingGroupSummary } from "../../../generated-client";

type Props = {
  summary: ServiceProvidingGroupSummary;
};

export const SpgpaPrintCuSummary = ({ summary }: Props) => {
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
          value={summary.technical_resource.maximum_active_power?.sum ?? 0}
          unit="W"
          storageScale={KILO}
        />
        <LabelValue
          label="Aggregated flexible power"
          value={cu.maximum_active_power?.sum ?? 0}
          unit="W"
          storageScale={KILO}
        />
        <LabelValue
          label="Aggregated flexible power (down)"
          value={cu.maximum_active_power_down?.sum ?? 0}
          unit="W"
          storageScale={KILO}
        />
        <LabelValue
          label="Aggregated flexible power (up)"
          value={cu.maximum_active_power_up?.sum ?? 0}
          unit="W"
          storageScale={KILO}
        />
      </div>
    </div>
  );
};

import { Heading, Loader, Panel } from "../../components/ui";
import { LabelValue } from "../../components/LabelValue";
import { KILO } from "../../utils/scales";
import { useTechnicalResources } from "../technical_resource/useTechnicalResources";

type Props = {
  controllableUnitId: number;
};

export const ControllableUnitTechnicalResourceSummary = ({
  controllableUnitId,
}: Props) => {
  const {
    data: technicalResources,
    isLoading,
    error,
  } = useTechnicalResources(controllableUnitId);

  if (error) throw error;
  if (isLoading) return <Loader />;

  const powers = (technicalResources ?? []).map(
    (resource) => resource.maximum_active_power,
  );
  const count = powers.length;
  const sum = powers.reduce((total, power) => total + power, 0);
  const average = count > 0 ? Math.round((sum / count) * 100) / 100 : 0;
  const min = powers.reduce(
    (minimum, power) => Math.min(minimum, power),
    powers[0] ?? 0,
  );
  const max = powers.reduce(
    (maximum, power) => Math.max(maximum, power),
    powers[0] ?? 0,
  );

  return (
    <Panel border className="h-fit p-4 sm:p-5 flex flex-col gap-4">
      <Heading size="large">Technical resource summary</Heading>
      <p>
        This controllable unit contains <b>{count}</b> technical resources. Here
        are the <b>rated power</b> aggregates computed across all of them:
      </p>
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <LabelValue
          label="Aggregated rated power"
          value={sum}
          unit="W"
          storageScale={KILO}
        />
        <LabelValue
          label="Average rated power"
          value={average}
          unit="W"
          storageScale={KILO}
        />
        <LabelValue
          label="Minimum rated power"
          value={min}
          unit="W"
          storageScale={KILO}
        />
        <LabelValue
          label="Maximum rated power"
          value={max}
          unit="W"
          storageScale={KILO}
        />
      </div>
    </Panel>
  );
};

import { ControllableUnit } from "../../../generated-client";
import { LabelValue } from "../../../components/LabelValue";

export const TechnicalInformation = ({
  controllableUnit,
}: {
  controllableUnit: ControllableUnit | undefined;
}) => {
  return (
    <div className="grid grid-cols-[1fr_5fr]  gap-2">
      <LabelValue
        tooltip={true}
        labelKey="controllable_unit.maximum_active_power"
        value={controllableUnit?.maximum_active_power}
        unit="kW"
      />
      <LabelValue
        tooltip={true}
        labelKey="controllable_unit.regulation_direction"
        value={controllableUnit?.regulation_direction}
      />
      <LabelValue
        tooltip={true}
        labelKey="controllable_unit.minimum_duration"
        value={controllableUnit?.minimum_duration}
        unit="s"
      />
      <LabelValue
        tooltip={true}
        labelKey="controllable_unit.maximum_duration"
        value={controllableUnit?.maximum_duration}
        unit="s"
      />
      <LabelValue
        tooltip={true}
        labelKey="controllable_unit.recovery_duration"
        value={controllableUnit?.recovery_duration?.toString()}
        unit="s"
      />
      <LabelValue
        tooltip={true}
        labelKey="controllable_unit.ramp_rate"
        value={controllableUnit?.ramp_rate}
        unit="kW/min"
      />
    </div>
  );
};

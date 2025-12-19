import { Box } from "@mui/material";
import { ControllableUnit } from "../../../generated-client";
import { LabelValue } from "../../../components/LabelValue";

export const TechnicalInformation = ({
  controllableUnit,
}: {
  controllableUnit: ControllableUnit | undefined;
}) => {
  return (
    <Box>
      <LabelValue
        labelKey="controllable_unit.maximum_available_capacity"
        value={controllableUnit?.maximum_available_capacity}
        unit="kW"
      />
      <LabelValue
        labelKey="controllable_unit.regulation_direction"
        value={controllableUnit?.regulation_direction}
      />
      <LabelValue
        labelKey="controllable_unit.minimum_duration"
        value={controllableUnit?.minimum_duration}
        unit="s"
      />
      <LabelValue
        labelKey="controllable_unit.maximum_duration"
        value={controllableUnit?.maximum_duration}
        unit="s"
      />
      <LabelValue
        labelKey="controllable_unit.recovery_duration"
        value={controllableUnit?.recovery_duration?.toString()}
        unit="s"
      />
      <LabelValue
        labelKey="controllable_unit.ramp_rate"
        value={controllableUnit?.ramp_rate}
        unit="kW/min"
      />
    </Box>
  );
};

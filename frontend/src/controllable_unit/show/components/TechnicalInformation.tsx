import { Box } from "@mui/material";
import { ControllableUnit } from "../../../generated-client";
import { LabelValue } from "./LabelValue";

export const TechnicalInformation = ({
  controllableUnit,
}: {
  controllableUnit: ControllableUnit | undefined;
}) => {
  return (
    <Box>
      <LabelValue
        label="controllable_unit.maximum_available_capacity"
        value={controllableUnit?.maximum_available_capacity}
        unit="kW"
      />
      <LabelValue
        label="controllable_unit.regulation_direction"
        value={controllableUnit?.regulation_direction}
      />
      <LabelValue
        label="controllable_unit.minimum_duration"
        value={controllableUnit?.minimum_duration}
        unit="s"
      />
      <LabelValue
        label="controllable_unit.maximum_duration"
        value={controllableUnit?.maximum_duration}
        unit="s"
      />
      <LabelValue
        label="controllable_unit.recovery_duration"
        value={controllableUnit?.recovery_duration?.toString()}
        unit="s"
      />
      <LabelValue
        label="controllable_unit.ramp_rate"
        value={controllableUnit?.ramp_rate}
        unit="kW/min"
      />
    </Box>
  );
};

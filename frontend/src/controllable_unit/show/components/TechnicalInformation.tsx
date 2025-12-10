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
        label="Maximum available capacity"
        value={controllableUnit?.maximum_available_capacity}
        unit="kW"
      />
      <LabelValue
        label="Regulation direction"
        value={controllableUnit?.regulation_direction}
      />
      <LabelValue
        label="Minimum duration"
        value={controllableUnit?.minimum_duration}
        unit="s"
      />
      <LabelValue
        label="Maximum duration"
        value={controllableUnit?.maximum_duration}
        unit="s"
      />
      <LabelValue
        label="Recovery duration"
        value={controllableUnit?.recovery_duration?.toString()}
        unit="s"
      />
      <LabelValue label="Ramp rate" value={controllableUnit?.ramp_rate} />
    </Box>
  );
};

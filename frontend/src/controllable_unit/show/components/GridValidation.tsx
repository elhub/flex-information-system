import { Box } from "@mui/material";
import { ControllableUnit } from "../../../generated-client";
import { LabelValue } from "../../../components/LabelValue";

export const GridValidation = ({
  controllableUnit,
}: {
  controllableUnit: ControllableUnit | undefined;
}) => {
  return (
    <Box>
      <LabelValue
        labelKey="controllable_unit.grid_node_id"
        value={controllableUnit?.grid_node_id}
      />
      <LabelValue
        labelKey="controllable_unit.grid_validation_status"
        value={controllableUnit?.grid_validation_status}
      />
      <LabelValue
        labelKey="controllable_unit.grid_validation_notes"
        value={controllableUnit?.grid_validation_notes}
      />
    </Box>
  );
};

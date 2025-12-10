import { Box } from "@mui/material";
import { ControllableUnit } from "../../../generated-client";
import { LabelValue } from "./LabelValue";

export const GridValidation = ({
  controllableUnit,
}: {
  controllableUnit: ControllableUnit | undefined;
}) => {
  return (
    <Box>
      <LabelValue label="Grid node ID" value={controllableUnit?.grid_node_id} />
      <LabelValue
        label="Grid validation status"
        value={controllableUnit?.grid_validation_status}
      />
      <LabelValue
        label="Grid validation notes"
        value={controllableUnit?.grid_validation_notes}
      />
    </Box>
  );
};

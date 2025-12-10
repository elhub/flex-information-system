import { Box, Typography } from "@mui/material";
import { ControllableUnit } from "../../../generated-client";

export const MetaInfo = ({
  controllableUnit,
}: {
  controllableUnit: ControllableUnit | undefined;
}) => {
  return (
    <Box sx={{ display: "flex", flexDirection: "row", gap: 1 }}>
      <Typography color="text.secondary">
        Recorded at:{" "}
        {controllableUnit?.recorded_at
          ? new Date(controllableUnit.recorded_at).toLocaleString("no-NO")
          : "N/A"}
      </Typography>
    </Box>
  );
};

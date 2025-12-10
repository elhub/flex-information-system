import { Box, Typography } from "@mui/material";
import {
  ControllableUnit,
  ControllableUnitSuspension,
} from "../../../generated-client";
import { StatusChip } from "./StatusChip";
import { Suspensions } from "./Suspensions";

export const Header = ({
  controllableUnit,
  suspensions,
}: {
  controllableUnit: ControllableUnit | undefined;
  suspensions: ControllableUnitSuspension[] | undefined;
}) => {
  return (
    <Box
      sx={{
        display: "flex",
        alignItems: "center",
        flexDirection: "row",
        gap: 2,
      }}
    >
      <Typography variant="h4" gutterBottom>
        Controllable Unit - {controllableUnit?.name} (
        {controllableUnit?.maximum_available_capacity} kW)
      </Typography>
      <StatusChip status={controllableUnit?.status ?? "active"} />
      <Suspensions suspensions={suspensions} />
    </Box>
  );
};

import { Chip, Stack, Typography } from "@mui/material";
import {
  ControllableUnit,
  ControllableUnitStatus,
} from "../../../generated-client";

const colorMap: Record<
  ControllableUnitStatus,
  "info" | "primary" | "secondary" | "warning"
> = {
  new: "info",
  active: "primary",
  inactive: "secondary",
  terminated: "warning",
};

export const Header = ({
  controllableUnit,
}: {
  controllableUnit: ControllableUnit | undefined;
}) => {
  return (
    <Stack direction="row" spacing={2} alignItems="center">
      <Typography variant="h4" gutterBottom>
        Controllable Unit - {controllableUnit?.name} (
        {controllableUnit?.maximum_available_capacity} kW)
      </Typography>
      <Chip
        label={controllableUnit?.status ?? "active"}
        color={colorMap[controllableUnit?.status ?? "active"]}
      />
    </Stack>
  );
};

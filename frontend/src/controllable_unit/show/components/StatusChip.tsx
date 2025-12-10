import { Chip } from "@mui/material";
import { ControllableUnitStatus } from "../../../generated-client";

export const StatusChip = ({ status }: { status: ControllableUnitStatus }) => {
  const colorMap: Record<
    ControllableUnitStatus,
    "info" | "primary" | "secondary" | "warning"
  > = {
    new: "info",
    active: "primary",
    inactive: "secondary",
    terminated: "warning",
  };

  return <Chip label={status} color={colorMap[status]} />;
};

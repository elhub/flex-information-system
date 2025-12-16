import { Link } from "react-admin";
import { ControllableUnitShowViewModel } from "../useControllableUnitViewModel";
import { Alert, AlertColor, AlertTitle, Button } from "@mui/material";
import { ReactNode } from "react";

type AlertType = {
  severity: AlertColor;
  title: string;
  content: ReactNode;
  action?: ReactNode;
};

const getAlert = (
  controllableUnitViewModel: ControllableUnitShowViewModel,
): AlertType | null => {
  const { controllableUnit, suspensions, technicalResources } =
    controllableUnitViewModel;

  if (suspensions?.length) {
    const suspension = suspensions[0];
    return {
      severity: "error",
      title: "Suspension",
      content: `The controllable unit is suspended. Reason: ${suspension.reason}`,
      action: (
        <Button
          component={Link}
          to={`/controllable_unit/${controllableUnit.id}/suspension/${suspension.id}/show`}
        >
          See suspension
        </Button>
      ),
    };
  }

  if (technicalResources?.length === 0) {
    return {
      severity: "info",
      title: "No technical resources",
      content:
        "To set the controllable unit as active, one technical resource is required.",
      action: (
        <Button
          component={Link}
          to={`/controllable_unit/${controllableUnit.id}/technical_resource/create`}
        >
          Add technical resource
        </Button>
      ),
    };
  }

  if (controllableUnit.status === "new") {
    return {
      severity: "info",
      title: "Not active",
      content:
        "The controllable unit is not active. Please set it as active to use it.",
      action: (
        <Button
          component={Link}
          to={`/controllable_unit/${controllableUnit.id}/edit`}
        >
          Edit status
        </Button>
      ),
    };
  }
  return null;
};

export const ControllableUnitAlerts = ({
  controllableUnitViewModel,
}: {
  controllableUnitViewModel: ControllableUnitShowViewModel;
}) => {
  const alert = getAlert(controllableUnitViewModel);
  if (!alert) {
    return null;
  }
  return (
    <Alert
      sx={{ maxWidth: 800 }}
      action={alert.action}
      variant="outlined"
      severity={alert.severity as AlertColor}
    >
      <AlertTitle>{alert.title}</AlertTitle>
      {alert.content}
    </Alert>
  );
};

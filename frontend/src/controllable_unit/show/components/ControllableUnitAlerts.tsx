import type { ControllableUnitShowViewModel } from "../useControllableUnitViewModel";
import { BodyText, Alert, Heading } from "../../../components/ui";

type AlertType = {
  severity: "info" | "success" | "warning" | "error";
  heading: string;
  body: string;
};

const useControllableUnitAlerts = (
  controllableUnitViewModel: ControllableUnitShowViewModel,
): AlertType | null => {
  const { controllableUnit, suspensions, technicalResources } =
    controllableUnitViewModel;

  if (suspensions?.length) {
    const suspension = suspensions[0];
    return {
      severity: "error",
      heading: "Controllable unit is suspended",
      body: `Reason: ${suspension.reason}`,
    };
  }

  if (technicalResources?.length === 0) {
    return {
      severity: "info",
      heading: "Add technical resources",
      body: "To set the controllable unit as active, at least one technical resource is required.",
    };
  }

  if (controllableUnit.status === "new") {
    return {
      severity: "info",
      heading: "Controllable unit is not active",
      body: "Controllable unit must be active to be added to a service providing group. Add all technical resources and ensure that data is correct before activating.",
    };
  }
  return null;
};

export const ControllableUnitAlerts = ({
  controllableUnitViewModel,
}: {
  controllableUnitViewModel: ControllableUnitShowViewModel;
}) => {
  const alert = useControllableUnitAlerts(controllableUnitViewModel);
  if (!alert) {
    return null;
  }
  return (
    <Alert variant={alert.severity} className="max-w-3xl">
      <Heading size="xsmall">{alert.heading}</Heading>
      <BodyText>{alert.body}</BodyText>
    </Alert>
  );
};

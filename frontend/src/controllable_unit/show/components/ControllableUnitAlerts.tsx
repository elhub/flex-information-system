import type { ControllableUnitShowViewModel } from "../useControllableUnitViewModel";
import type { ReactNode } from "react";
import { TechnicalResourceInputLocationState } from "../../technical_resource/TechnicalResourceInput";
import { BodyText, Alert } from "../../../components/ui";

type AlertType = {
  severity: "info" | "success" | "warning" | "error";
  title: string;
  content: ReactNode;
  action?: ReactNode;
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
      title: "Suspension",
      content: `The controllable unit is suspended. Reason: ${suspension.reason}`,
    };
  }

  if (technicalResources?.length === 0) {
    return {
      severity: "info",
      title: "No technical resources",
      content:
        "To set the controllable unit as active, one technical resource is required.",
    };
  }

  if (controllableUnit.status === "new") {
    return {
      severity: "info",
      title: "Not active",
      content:
        "The controllable unit is not active.",
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
    <Alert variant={alert.severity} className="max-w-3xl gap-4">
        <BodyText>{alert.content}</BodyText>
    </Alert>
  );
};

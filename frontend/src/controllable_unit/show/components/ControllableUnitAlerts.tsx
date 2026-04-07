import type { ControllableUnitShowViewModel } from "../useControllableUnitViewModel";
import { BodyText, Alert, Heading } from "../../../components/ui";

type AlertType = {
  severity: "info" | "success" | "warning" | "error";
  content: string;
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
      content: `The controllable unit is suspended. Reason: ${suspension.reason}`,
    };
  }

  if (technicalResources?.length === 0) {
    return {
      severity: "info",
      content:
        "To set the controllable unit as active, one technical resource is required.",
    };
  }

  if (controllableUnit.status === "new") {
    return {
      severity: "info",
      content: "The controllable unit is not active.",
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
      <div className="flex flex-col gap-2">
        <BodyText> {alert.content}</BodyText>
      </div>
    </Alert>
  );
};

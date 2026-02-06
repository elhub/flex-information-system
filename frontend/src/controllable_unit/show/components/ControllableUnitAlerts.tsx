import { Link, usePermissions } from "react-admin";
import { ControllableUnitShowViewModel } from "../useControllableUnitViewModel";
import { ReactNode } from "react";
import { Permissions } from "../../../auth/permissions";
import { ActivateControllableUnitButton } from "./ActivateControllableUnitButton";
import { TechnicalResourceInputLocationState } from "../../technical_resource/TechnicalResourceInput";
import { BodyText, Heading, Alert, Button } from "../../../components/ui";

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
  const { permissions } = usePermissions<Permissions>();
  const canCreateTechnicalResource = permissions?.allow(
    "technical_resource",
    "create",
  );
  const canUpdateControllableUnit = permissions?.allow(
    "controllable_unit",
    "update",
  );
  if (suspensions?.length) {
    const suspension = suspensions[0];
    return {
      severity: "error",
      title: "Suspension",
      content: `The controllable unit is suspended. Reason: ${suspension.reason}`,
      action: (
        <Button
          as={Link}
          to={`/controllable_unit/${controllableUnit.id}/suspension/${suspension.id}/show`}
        >
          See suspension
        </Button>
      ),
    };
  }

  if (technicalResources?.length === 0) {
    const locationState: TechnicalResourceInputLocationState = {
      technicalResource: {
        controllable_unit_id: controllableUnit.id,
      },
    };
    return {
      severity: "info",
      title: "No technical resources",
      content:
        "To set the controllable unit as active, one technical resource is required.",
      action: (
        <Button
          as={Link}
          disabled={!canCreateTechnicalResource}
          state={locationState}
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
        <ActivateControllableUnitButton
          controllableUnitId={controllableUnit.id}
          disabled={!canUpdateControllableUnit}
        />
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
  const alert = useControllableUnitAlerts(controllableUnitViewModel);
  if (!alert) {
    return null;
  }
  return (
    <Alert variant={alert.severity} className="max-w-3xl gap-4">
      <div className="flex flex-row items-center justify-between w-full!">
        <div className="flex flex-col gap-2">
          <Heading level={5} size="small">
            {alert.title}
          </Heading>
          <BodyText>{alert.content}</BodyText>
        </div>
        {alert.action && <>{alert.action}</>}
      </div>
    </Alert>
  );
};

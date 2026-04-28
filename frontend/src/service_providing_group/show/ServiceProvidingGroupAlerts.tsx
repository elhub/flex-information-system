import { ReactNode } from "react";
import { ServiceProvidingGroup } from "../../generated-client";
import { Alert, BodyText } from "../../components/ui";
import { useSpgProductApplications } from "./useSpgProductApplications";

type AlertType = {
  severity: "info" | "success" | "warning" | "error";
  content: ReactNode;
};

const useServiceProvidingGroupAlerts = (
  spg: ServiceProvidingGroup,
): AlertType | null => {
  const { data: productApplications } = useSpgProductApplications(spg.id);

  if (spg.status === "new") {
    return {
      severity: "info",
      content: "The service providing group is not active.",
    };
  }

  if (productApplications?.length === 0) {
    return {
      severity: "info",
      content: "You don't have a product application for this SPG.",
    };
  }

  return null;
};

type Props = {
  spg: ServiceProvidingGroup;
};

export const ServiceProvidingGroupAlerts = (props: Props) => {
  const alert = useServiceProvidingGroupAlerts(props.spg);

  if (!alert) {
    return null;
  }

  return (
    <Alert variant={alert.severity} className="max-w-3xl gap-4">
      <BodyText>{alert.content}</BodyText>
    </Alert>
  );
};

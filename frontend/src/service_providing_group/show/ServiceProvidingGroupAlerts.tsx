import { ServiceProvidingGroup } from "../../generated-client";
import { Alert, BodyText, Heading } from "../../components/ui";
import { useSpgProductApplications } from "./useSpgProductApplications";
import { useGetIdentity, UserIdentity } from "react-admin";

type AlertType = {
  severity: "info" | "success" | "warning" | "error";
  heading: string;
  body: string;
};

const useServiceProvidingGroupAlerts = (
  spg: ServiceProvidingGroup,
): AlertType | null => {
  const { data: productApplications } = useSpgProductApplications(spg.id);
  const { data: identity } = useGetIdentity();

  const isServiceProvider =
    (identity as UserIdentity | undefined)?.role === "flex_service_provider";

  if (!isServiceProvider) {
    return null;
  }

  if (spg.status === "new") {
    return {
      severity: "info",
      heading: "Service providing group is not active",
      body: "Activating the service providing group will allow it to be used in a product application.",
    };
  }

  if (productApplications?.length === 0) {
    return {
      severity: "info",
      heading: "No product application",
      body: "There are no product applications for this service providing group.",
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
      <Heading size="xsmall">{alert.heading}</Heading>
      <BodyText>{alert.body}</BodyText>
    </Alert>
  );
};

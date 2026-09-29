import { ServiceProvidingGroup } from "../../generated-client";
import { useSpgProductApplications } from "./useSpgProductApplications";
import { useGetIdentity, UserIdentity } from "react-admin";

type AlertType = {
  severity: "info" | "success" | "warning" | "error";
  heading: string;
  body: string;
};

export const useServiceProvidingGroupAlerts = (
  spg?: ServiceProvidingGroup | undefined,
): AlertType | undefined => {
  const { data: productApplications } = useSpgProductApplications(spg?.id);
  const { data: identity } = useGetIdentity();

  const isServiceProvider =
    (identity as UserIdentity | undefined)?.role === "flex_service_provider";

  if (!spg || !isServiceProvider) {
    return undefined;
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

  return undefined;
};

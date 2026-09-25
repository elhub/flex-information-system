import { ServiceProvidingGroupProductApplication } from "../../../generated-client";
import type { AlertType } from "../../../components/ResourceShowLayout";
import { useGetIdentity } from "react-admin";

export const useSpgpaAlerts = (
  spgpa: ServiceProvidingGroupProductApplication | undefined,
): AlertType | undefined => {
  const { data: identity } = useGetIdentity();
  const isSystemOperator = identity?.role === "flex_system_operator";

  if (!spgpa || !isSystemOperator || spgpa.status !== "requested") {
    return undefined;
  }

  return {
    severity: "info",
    body: "The procuring system operator must now shortly start prequalification or verification on this application.",
  };
};

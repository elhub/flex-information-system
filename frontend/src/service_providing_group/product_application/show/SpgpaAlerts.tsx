import { ServiceProvidingGroupProductApplication } from "../../../generated-client";
import type { AlertType } from "../../../components/ResourceShowLayout";
import { useGetIdentity } from "react-admin";
import { useTranslate } from "ra-core";

export const useSpgpaAlerts = (
  spgpa: ServiceProvidingGroupProductApplication | undefined,
): AlertType | undefined => {
  const { data: identity } = useGetIdentity();
  const translate = useTranslate();
  const isSystemOperator = identity?.role === "flex_system_operator";

  if (!spgpa || !isSystemOperator || spgpa.status !== "requested") {
    return undefined;
  }

  return {
    severity: "info",
    body: translate("text.spgpa_show_requested_alert_body"),
  };
};

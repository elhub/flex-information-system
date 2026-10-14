import type { ControllableUnitShowViewModel } from "../useControllableUnitViewModel";
import type { AlertType } from "../../../components/ResourceShowLayout";
import { useTranslate } from "ra-core";

export const useControllableUnitAlerts = (
  controllableUnitViewModel: ControllableUnitShowViewModel | undefined,
): AlertType | undefined => {
  const translate = useTranslate();

  if (!controllableUnitViewModel) {
    return undefined;
  }

  const { controllableUnit, suspensions, technicalResources } =
    controllableUnitViewModel;

  if (suspensions?.length) {
    const suspension = suspensions[0];
    return {
      severity: "error",
      heading: translate("text.cu_show_suspended_heading"),
      body: translate("text.cu_show_suspended_body", {
        reason: suspension.reason,
      }),
    };
  }

  if (
    controllableUnit.status === "active" &&
    technicalResources &&
    technicalResources.length > 0 &&
    controllableUnit.maximum_active_power >
      technicalResources.reduce((s, tr) => s + tr.maximum_active_power, 0)
  ) {
    return {
      severity: "warning",
      heading: translate("text.cu_flexible_power_exceeds_rated_power_heading"),
      body: translate("text.cu_flexible_power_exceeds_rated_power_body"),
    };
  }

  if (technicalResources?.length === 0) {
    return {
      severity: "info",
      heading: translate("text.cu_show_add_technical_resources_heading"),
      body: translate("text.cu_show_add_technical_resources_body"),
    };
  }

  if (controllableUnit.status === "new") {
    return {
      severity: "info",
      heading: translate("text.cu_show_not_active_heading"),
      body: translate("text.cu_show_not_active_body"),
    };
  }
  return undefined;
};

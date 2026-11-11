import { useTranslate } from "ra-core";
import type { ResourceSummaryField } from "../../components/ResourceShowLayout";
import type { SpgpaApplicationDetails } from "../../generated-client";
import { useTranslateEnum } from "../../intl/intl";
import { KILO, Scale } from "../../utils/scales";

const RESOURCE = "service_providing_group_product_application";

// summary fields of the product-specific application details
export const useSpgpaDetailsSummary = (
  details: SpgpaApplicationDetails | null | undefined,
  powerScale: Scale = KILO,
): ResourceSummaryField[] => {
  const translate = useTranslate();
  const translateEnum = useTranslateEnum();

  if (!details) return [];

  const power = {
    unit: "W",
    storageScale: KILO,
    displayScale: powerScale,
  };
  const text = (value: string) => (
    <span className="whitespace-pre-wrap">{value}</span>
  );
  const yesNo = (value: boolean) =>
    translate(value ? "text.boolean_yes" : "text.boolean_no");

  switch (details.kind) {
    case "manual_frequency_restoration":
      return [
        {
          labelKey: `${RESOURCE}.maximum_active_power_up`,
          value: details.maximum_active_power_up,
          ...power,
        },
        {
          labelKey: `${RESOURCE}.maximum_active_power_down`,
          value: details.maximum_active_power_down,
          ...power,
        },
        {
          labelKey: `${RESOURCE}.ramping_capability`,
          value: translateEnum(
            `${RESOURCE}.ramping_capability.${details.ramping_capability}`,
          ),
        },
        {
          labelKey: `${RESOURCE}.ramping_description`,
          value: text(details.ramping_description),
        },
        {
          shouldShow: !!details.additional_information,
          labelKey: `${RESOURCE}.additional_information`,
          value: text(details.additional_information ?? ""),
        },
      ];
    case "automatic_frequency_containment":
    case "automatic_frequency_containment_disturbance":
      return [
        {
          label: translate("text.spgpa_service_provider_contact_information"),
          value: text(details.service_provider_contact_information),
        },
        {
          label: translate("text.spgpa_technical_contact_information"),
          value: text(details.technical_contact_information),
        },
        {
          label: translate("text.spgpa_limited_energy_reservoir"),
          value: yesNo(details.limited_energy_reservoir),
        },
        {
          label: translate("text.spgpa_variable_production_consumption"),
          value: yesNo(details.variable_production_consumption),
        },
        {
          label: translate("text.spgpa_planned_prequalification_test_date"),
          value: details.planned_prequalification_test_date,
        },
        ...(details.kind === "automatic_frequency_containment"
          ? [
              {
                label: translate("text.spgpa_maximum_active_power"),
                value: details.maximum_active_power_up,
                ...power,
              },
            ]
          : [
              {
                labelKey: `${RESOURCE}.maximum_active_power_up` as const,
                value: details.maximum_active_power_up,
                ...power,
              },
              {
                labelKey: `${RESOURCE}.maximum_active_power_down` as const,
                value: details.maximum_active_power_down,
                ...power,
              },
            ]),
      ];
  }
};

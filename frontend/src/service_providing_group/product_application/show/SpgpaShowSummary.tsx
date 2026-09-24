import type { ResourceSummaryField } from "../../../components/ResourceShowLayout";
import { KILO, Scale } from "../../../utils/scales";
import {
  ServiceProvidingGroup,
  ServiceProvidingGroupProductApplication,
} from "../../../generated-client";
import { useGetAllProductTypes } from "../../../product_type/components";
import { useTranslateEnum } from "../../../intl/intl";
import { useParty } from "../../../hooks/party";
import { toDateTimeString } from "../../../util";

type Props = {
  spgpa: ServiceProvidingGroupProductApplication | undefined;
  spg: ServiceProvidingGroup | undefined;
  powerScale: Scale;
};

export const useSpgpaShowSummary = ({
  spgpa,
  spg,
  powerScale,
}: Props): ResourceSummaryField[] => {
  const translateEnum = useTranslateEnum();
  const procuringServiceProvider = useParty(
    spgpa?.procuring_system_operator_id,
  );

  if (procuringServiceProvider.error) throw procuringServiceProvider.error;

  const productTypes = useGetAllProductTypes();
  const productTypeNames = productTypes
    ?.filter((pt) => spgpa?.product_type_ids.includes(pt.id))
    .map((pt) => pt.name)
    .join(", ");

  if (!spgpa) return [];

  return [
    {
      key: "service_providing_group",
      label: "Service providing group",
      value: spg ? `${spg.name} (#${spg.id})` : undefined,
    },
    {
      key: "system_operator",
      label: "System operator / PSO",
      value: procuringServiceProvider.data?.name,
    },
    {
      key: "product_types",
      label: "Product types",
      value: productTypeNames,
    },
    {
      key: "bidding_zone",
      label: "Bidding Zone",
      value: spg?.bidding_zone,
    },
    {
      key: "maximum_active_power_up",
      label: "Max active power (up)",
      value: spgpa.maximum_active_power_up,
      unit: "W",
      storageScale: KILO,
      displayScale: powerScale,
    },
    {
      key: "maximum_active_power_down",
      label: "Max active power (down)",
      value: spgpa.maximum_active_power_down,
      unit: "W",
      storageScale: KILO,
      displayScale: powerScale,
    },
    {
      key: "ramping_capability",
      shouldShow: !!spgpa.ramping_capability,
      labelKey:
        "service_providing_group_product_application.ramping_capability",
      value:
        spgpa.ramping_capability &&
        translateEnum(
          `service_providing_group_product_application.ramping_capability.${spgpa.ramping_capability}`,
        ),
    },
    {
      key: "ramping_description",
      labelKey:
        "service_providing_group_product_application.ramping_description",
      value: (
        <span className="whitespace-pre-wrap">{spgpa.ramping_description}</span>
      ),
    },
    {
      key: "additional_information",
      shouldShow: !!spgpa.additional_information,
      label: "Additional information",
      value: (
        <span className="whitespace-pre-wrap">
          {spgpa.additional_information}
        </span>
      ),
    },
    {
      key: "created_at",
      label: "Created at",
      value: toDateTimeString(spgpa.created_at),
    },
    {
      key: "prequalified_at",
      shouldShow: !!spgpa.prequalified_at,
      label: "Prequalified at",
      value: toDateTimeString(spgpa.prequalified_at),
    },
    {
      key: "verified_at",
      shouldShow: !!spgpa.verified_at,
      label: "Verified at",
      value: toDateTimeString(spgpa.verified_at),
    },
    {
      key: "complete_at",
      shouldShow: !!spgpa.complete_at,
      label: "Complete at",
      value: toDateTimeString(spgpa.complete_at),
    },
  ];
};

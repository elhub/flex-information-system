import type { ResourceSummaryField } from "../../../components/ResourceShowLayout";
import { Scale } from "../../../utils/scales";
import {
  ServiceProvidingGroup,
  ServiceProvidingGroupProductApplication,
} from "../../../generated-client";
import { useGetAllProductTypes } from "../../../product_type/components";
import { useSpgpaDetailsSummary } from "../useSpgpaDetailsSummary";
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
  const detailsFields = useSpgpaDetailsSummary(
    spgpa?.application_details,
    powerScale,
  );
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
      labelKey:
        "service_providing_group_product_application.service_providing_group_id",
      value: spg ? `${spg.name} (#${spg.id})` : undefined,
    },
    {
      labelKey:
        "service_providing_group_product_application.procuring_system_operator_id",
      value: procuringServiceProvider.data?.name,
    },
    {
      labelKey: "service_providing_group_product_application.product_type_ids",
      value: productTypeNames,
    },
    {
      labelKey: "service_providing_group.bidding_zone",
      value: spg?.bidding_zone,
    },
    ...detailsFields,
    {
      tooltip: true,
      labelKey: "service_providing_group_product_application.created_at",
      value: toDateTimeString(spgpa.created_at),
    },
    {
      tooltip: true,
      shouldShow: !!spgpa.prequalified_at,
      labelKey: "service_providing_group_product_application.prequalified_at",
      value: toDateTimeString(spgpa.prequalified_at),
    },
    {
      tooltip: true,
      shouldShow: !!spgpa.verified_at,
      labelKey: "service_providing_group_product_application.verified_at",
      value: toDateTimeString(spgpa.verified_at),
    },
    {
      tooltip: true,
      shouldShow: !!spgpa.complete_at,
      labelKey: "service_providing_group_product_application.complete_at",
      value: toDateTimeString(spgpa.complete_at),
    },
  ];
};

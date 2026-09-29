import type { ResourceSummaryField } from "../../components/ResourceShowLayout";
import type { ServiceProvidingGroup } from "../../generated-client";
import { useParty } from "../../hooks/party";
import { useTranslateEnum } from "../../intl/intl";
import { toDateTimeString } from "../../util";

type Props = {
  spg: ServiceProvidingGroup | undefined;
};

type ServiceProvidingGroupSummaryFields = [
  serviceProvider: ResourceSummaryField,
  biddingZone: ResourceSummaryField,
  createdAt: ResourceSummaryField,
];

export const useServiceProvidingGroupShowSummary = ({
  spg,
}: Props): ServiceProvidingGroupSummaryFields => {
  const translateEnum = useTranslateEnum();
  const serviceProvider = useParty(spg?.service_provider_id);

  if (serviceProvider.error) throw serviceProvider.error;

  return [
    {
      labelKey: "service_providing_group.service_provider_id",
      value: serviceProvider.data?.name,
    },
    {
      labelKey: "service_providing_group.bidding_zone",
      value:
        spg?.bidding_zone &&
        translateEnum(
          `service_providing_group.bidding_zone.${spg.bidding_zone}`,
        ),
    },
    {
      labelKey: "service_providing_group.created_at",
      value: spg && toDateTimeString(spg.created_at),
    },
  ];
};

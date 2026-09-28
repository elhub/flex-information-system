import type { ResourceSummaryField } from "../../components/ResourceShowLayout";
import type { ServiceProvidingGroup } from "../../generated-client";
import { useParty } from "../../hooks/party";
import { useTranslateEnum } from "../../intl/intl";
import { KILO, Scale } from "../../utils/scales";
import { toDateTimeString } from "../../util";

type Props = {
  spg: ServiceProvidingGroup | undefined;
  powerScale: Scale;
};

export const useServiceProvidingGroupShowSummary = ({
  spg,
  powerScale,
}: Props): ResourceSummaryField[] => {
  const translateEnum = useTranslateEnum();
  const serviceProvider = useParty(spg?.service_provider_id);

  if (serviceProvider.error) throw serviceProvider.error;

  if (!spg) return [];

  const summary = spg.summary;
  const controllableUnit = summary?.controllable_unit;
  const technicalResource = summary?.technical_resource;

  return [
    {
      labelKey: "service_providing_group.service_provider_id",
      value: serviceProvider.data?.name,
    },
    {
      labelKey: "service_providing_group.bidding_zone",
      value:
        spg.bidding_zone &&
        translateEnum(
          `service_providing_group.bidding_zone.${spg.bidding_zone}`,
        ),
    },
    {
      label: "Number of controllable units",
      value: controllableUnit?.count ?? 0,
    },
    {
      label: "Number of technical resources",
      value: technicalResource?.count ?? 0,
    },
    {
      label: "Aggregated rated power",
      value: technicalResource?.maximum_active_power?.sum ?? 0,
      unit: "W",
      storageScale: KILO,
      displayScale: powerScale,
    },
    {
      label: "Aggregated flexible power (up)",
      value: controllableUnit?.maximum_active_power_up?.sum ?? 0,
      unit: "W",
      storageScale: KILO,
      displayScale: powerScale,
    },
    {
      label: "Aggregated flexible power (down)",
      value: controllableUnit?.maximum_active_power_down?.sum ?? 0,
      unit: "W",
      storageScale: KILO,
      displayScale: powerScale,
    },
    {
      shouldShow: !!spg.additional_information,
      labelKey: "service_providing_group.additional_information",
      value: (
        <span className="whitespace-pre-wrap">
          {spg.additional_information}
        </span>
      ),
    },
    {
      labelKey: "service_providing_group.created_at",
      value: toDateTimeString(spg.created_at),
    },
  ];
};

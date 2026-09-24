import type { ResourceSummaryField } from "../../components/ResourceShowLayout";
import type { ControllableUnitShowViewModel } from "./useControllableUnitViewModel";
import { formatDate } from "date-fns";
import { useTranslate } from "ra-core";

const formatRange = (start?: string, end?: string) => {
  if (!start) return undefined;
  if (!end) return `${formatDate(start, "dd.MM.yyyy")} - present`;
  return `${formatDate(start, "dd.MM.yyyy")} - ${formatDate(end, "dd.MM.yyyy")}`;
};

export const useControllableUnitShowSummary = ({
  viewModel,
}: {
  viewModel: ControllableUnitShowViewModel | undefined;
}): ResourceSummaryField[] => {
  const translate = useTranslate();

  if (!viewModel) return [];

  const {
    controllableUnit,
    serviceProvider,
    controllableUnitServiceProvider,
    balanceResponsibleParty,
    accountingPointBalanceResponsibleParty,
    accountingPoint,
    systemOperator,
    biddingZone,
    meteringGridArea,
    energySupplier,
  } = viewModel;
  const serviceProviderRange = formatRange(
    controllableUnitServiceProvider?.valid_from,
    controllableUnitServiceProvider?.valid_to,
  );
  const balanceResponsiblePartyRange = formatRange(
    accountingPointBalanceResponsibleParty?.valid_from,
    accountingPointBalanceResponsibleParty?.valid_to,
  );

  return [
    {
      key: "business_id",
      labelKey: "controllable_unit.business_id",
      value: controllableUnit.business_id,
    },
    {
      key: "accounting_point",
      label: "Accounting point",
      value: accountingPoint
        ? systemOperator
          ? `${accountingPoint.business_id} (${systemOperator.name})`
          : accountingPoint.business_id
        : undefined,
    },
    {
      key: "metering_grid_area",
      label: "Metering grid area",
      value: meteringGridArea?.name,
    },
    {
      key: "bidding_zone",
      label: "Bidding zone",
      value: biddingZone
        ? translate(
            `enum.accounting_point_bidding_zone.bidding_zone.${biddingZone}`,
          )
        : "-",
    },
    {
      key: "service_provider",
      label: "Service provider",
      value: serviceProvider
        ? serviceProviderRange
          ? `${serviceProvider.name} (${serviceProviderRange})`
          : serviceProvider.name
        : "No service provider",
    },
    {
      key: "balance_responsible_party",
      label: "Balance responsible party",
      value: balanceResponsibleParty
        ? balanceResponsiblePartyRange
          ? `${balanceResponsibleParty.name} (${balanceResponsiblePartyRange})`
          : balanceResponsibleParty.name
        : "No balance responsible party",
    },
    {
      key: "energy_supplier",
      label: "Energy supplier",
      value: energySupplier?.name,
    },
    {
      key: "maximum_active_power",
      tooltip: true,
      labelKey: "controllable_unit.maximum_active_power",
      value: `${controllableUnit.maximum_active_power} kW`,
    },
    {
      key: "regulation_direction",
      tooltip: true,
      labelKey: "controllable_unit.regulation_direction",
      value: controllableUnit.regulation_direction,
    },
    {
      key: "additional_information",
      tooltip: true,
      labelKey: "controllable_unit.additional_information",
      value: controllableUnit.additional_information ? (
        <span className="whitespace-pre-wrap">
          {controllableUnit.additional_information}
        </span>
      ) : undefined,
    },
    {
      key: "recorded_at",
      labelKey: "controllable_unit.recorded_at",
      value: controllableUnit.recorded_at
        ? formatDate(controllableUnit.recorded_at, "dd.MM.yyyy HH:mm")
        : undefined,
    },
  ];
};

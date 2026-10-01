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
      labelKey: "controllable_unit.business_id",
      value: controllableUnit.business_id,
    },
    {
      labelKey: "accounting_point_bidding_zone.accounting_point_id",
      value: accountingPoint
        ? systemOperator
          ? `${accountingPoint.business_id} (${systemOperator.name})`
          : accountingPoint.business_id
        : undefined,
    },
    {
      labelKey: "accounting_point_metering_grid_area.metering_grid_area_id",
      value: meteringGridArea?.name,
    },
    {
      labelKey: "accounting_point_bidding_zone.bidding_zone",
      value: biddingZone
        ? translate(
            `enum.accounting_point_bidding_zone.bidding_zone.${biddingZone}`,
          )
        : "-",
    },
    {
      labelKey: "controllable_unit_service_provider.service_provider_id",
      value: serviceProvider
        ? serviceProviderRange
          ? `${serviceProvider.name} (${serviceProviderRange})`
          : serviceProvider.name
        : translate("text.cu_show_no_service_provider"),
    },
    {
      labelKey:
        "accounting_point_balance_responsible_party.balance_responsible_party_id",
      value: balanceResponsibleParty
        ? balanceResponsiblePartyRange
          ? `${balanceResponsibleParty.name} (${balanceResponsiblePartyRange})`
          : balanceResponsibleParty.name
        : translate("text.cu_show_no_balance_responsible_party"),
    },
    {
      labelKey: "accounting_point_energy_supplier.energy_supplier_id",
      value: energySupplier?.name,
    },
    {
      tooltip: true,
      labelKey: "controllable_unit.maximum_active_power",
      value: `${controllableUnit.maximum_active_power} kW`,
    },
    {
      tooltip: true,
      labelKey: "controllable_unit.regulation_direction",
      value: controllableUnit.regulation_direction,
    },
    {
      tooltip: true,
      labelKey: "controllable_unit.additional_information",
      value: controllableUnit.additional_information ? (
        <span className="whitespace-pre-wrap">
          {controllableUnit.additional_information}
        </span>
      ) : undefined,
    },
    {
      labelKey: "controllable_unit.recorded_at",
      value: controllableUnit.recorded_at
        ? formatDate(controllableUnit.recorded_at, "dd.MM.yyyy HH:mm")
        : undefined,
    },
  ];
};

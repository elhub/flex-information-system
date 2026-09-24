import { Panel } from "../../components/ui";
import { LabelValue } from "../../components/LabelValue";
import type { ControllableUnitShowViewModel } from "./useControllableUnitViewModel";
import { formatDate } from "date-fns";
import { useTranslate } from "ra-core";

const formatRange = (start?: string, end?: string) => {
  if (!start) return undefined;
  if (!end) return `${formatDate(start, "dd.MM.yyyy")} - present`;
  return `${formatDate(start, "dd.MM.yyyy")} - ${formatDate(end, "dd.MM.yyyy")}`;
};

export const ControllableUnitShowSummary = ({
  viewModel,
}: {
  viewModel: ControllableUnitShowViewModel;
}) => {
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
  const translate = useTranslate();
  const serviceProviderRange = formatRange(
    controllableUnitServiceProvider?.valid_from,
    controllableUnitServiceProvider?.valid_to,
  );
  const balanceResponsiblePartyRange = formatRange(
    accountingPointBalanceResponsibleParty?.valid_from,
    accountingPointBalanceResponsibleParty?.valid_to,
  );
  return (
    <div className="flex flex-col gap-4">
      <Panel
        border
        className="bg-semantic-background-alternative h-fit p-4 sm:p-5"
      >
        <div className="flex flex-col gap-4">
          <LabelValue
            size="small"
            labelKey="controllable_unit.business_id"
            value={controllableUnit.business_id}
          />
          <LabelValue
            size="small"
            label="Accounting point"
            value={
              accountingPoint
                ? systemOperator
                  ? `${accountingPoint.business_id} (${systemOperator.name})`
                  : accountingPoint.business_id
                : undefined
            }
          />
          <LabelValue
            size="small"
            label="Metering grid area"
            value={meteringGridArea?.name}
          />
          <LabelValue
            size="small"
            label="Bidding zone"
            value={
              biddingZone
                ? translate(
                    `enum.accounting_point_bidding_zone.bidding_zone.${biddingZone}`,
                  )
                : "-"
            }
          />
          <LabelValue
            size="small"
            label="Service provider"
            value={
              serviceProvider
                ? serviceProviderRange
                  ? `${serviceProvider.name} (${serviceProviderRange})`
                  : serviceProvider.name
                : "No service provider"
            }
          />
          <LabelValue
            size="small"
            label="Balance responsible party"
            value={
              balanceResponsibleParty
                ? balanceResponsiblePartyRange
                  ? `${balanceResponsibleParty.name} (${balanceResponsiblePartyRange})`
                  : balanceResponsibleParty.name
                : "No balance responsible party"
            }
          />
          <LabelValue
            size="small"
            label="Energy supplier"
            value={energySupplier?.name}
          />
          <LabelValue
            size="small"
            tooltip
            labelKey="controllable_unit.maximum_active_power"
            value={`${controllableUnit.maximum_active_power} kW`}
          />
          <LabelValue
            size="small"
            tooltip
            labelKey="controllable_unit.regulation_direction"
            value={controllableUnit.regulation_direction}
          />
          <LabelValue
            size="small"
            tooltip
            labelKey="controllable_unit.additional_information"
            value={
              controllableUnit.additional_information ? (
                <span className="whitespace-pre-wrap">
                  {controllableUnit.additional_information}
                </span>
              ) : undefined
            }
          />
          <LabelValue
            size="small"
            labelKey="controllable_unit.recorded_at"
            value={
              controllableUnit.recorded_at
                ? formatDate(controllableUnit.recorded_at, "dd.MM.yyyy HH:mm")
                : undefined
            }
          />
        </div>
      </Panel>
    </div>
  );
};

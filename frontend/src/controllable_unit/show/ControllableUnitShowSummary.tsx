import { Panel } from "../../components/ui";
import { LabelValue } from "../../components/LabelValue";
import type { ControllableUnitShowViewModel } from "./useControllableUnitViewModel";
import { formatDate } from "date-fns";

const formatRange = (start: string | undefined, end: string | undefined) => {
  if (!start) {
    return undefined;
  }

  if (!end) {
    return `${formatDate(start, "dd.MM.yyyy")} - present`;
  }

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
    accountingPoint,
    systemOperator,
  } = viewModel;

  const serviceProviderRange = formatRange(
    controllableUnitServiceProvider?.valid_from,
    controllableUnitServiceProvider?.valid_to,
  );

  return (
    <Panel
      border
      className="bg-semantic-background-alternative h-fit p-4 sm:p-5"
    >
      <div className="grid grid-cols-[1fr_2fr] gap-x-4 gap-y-3">
        <LabelValue
          labelKey="controllable_unit.id"
          value={controllableUnit.id}
        />
        <LabelValue
          labelKey="controllable_unit.business_id"
          value={controllableUnit.business_id}
        />
        <LabelValue
          label="Accounting point"
          value={
            accountingPoint && systemOperator
              ? `${accountingPoint.business_id} (${systemOperator.name})`
              : undefined
          }
        />
        <LabelValue
          label="Service provider"
          value={
            serviceProvider
              ? serviceProviderRange
                ? `${serviceProvider.name} (${serviceProviderRange})`
                : serviceProvider.name
              : "No service provider"
          }
          link={
            serviceProvider
              ? `/controllable_unit/${controllableUnit.id}/service_provider`
              : undefined
          }
          linkText={serviceProvider ? "See all contracts" : undefined}
        />
        <LabelValue
          labelKey="accounting_point_balance_responsible_party.balance_responsible_party_id"
          value={
            balanceResponsibleParty?.name ?? "No balance responsible party"
          }
          link={
            balanceResponsibleParty
              ? `/controllable_unit/${controllableUnit.id}/balance_responsible_party`
              : undefined
          }
          linkText={
            balanceResponsibleParty
              ? "See all balance responsible parties"
              : undefined
          }
        />
        <LabelValue
          tooltip
          labelKey="controllable_unit.maximum_active_power"
          value={controllableUnit.maximum_active_power}
          unit="kW"
        />
        <LabelValue
          tooltip
          labelKey="controllable_unit.regulation_direction"
          value={controllableUnit.regulation_direction}
        />
        <LabelValue
          labelKey="controllable_unit.recorded_at"
          value={
            controllableUnit.recorded_at
              ? formatDate(controllableUnit.recorded_at, "dd.MM.yyyy HH:mm")
              : undefined
          }
        />
      </div>
    </Panel>
  );
};

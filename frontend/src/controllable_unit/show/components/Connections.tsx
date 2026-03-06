import { LabelValue } from "../../../components/LabelValue";
import { ControllableUnitShowViewModel } from "../useControllableUnitViewModel";
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

export const Connections = ({
  controllableUnitViewModel,
}: {
  controllableUnitViewModel: ControllableUnitShowViewModel;
}) => {
  const {
    serviceProvider,
    controllableUnitServiceProvider,
    balanceResponsibleParty,
    accountingPoint,
    systemOperator,
    controllableUnit,
  } = controllableUnitViewModel;
  const serviceProviderRange = formatRange(
    controllableUnitServiceProvider?.valid_from,
    controllableUnitServiceProvider?.valid_to,
  );

  return (
    <div className="grid grid-cols-[1fr_5fr]  gap-2">
      <LabelValue labelKey="controllable_unit.id" value={controllableUnit.id} />
      <LabelValue
        labelKey="controllable_unit.business_id"
        value={controllableUnit.business_id}
      />
      <LabelValue
        label="Accounting point"
        value={`${accountingPoint?.business_id} (${systemOperator?.name})`}
      />
      <LabelValue
        label="Service provider"
        value={
          serviceProvider
            ? `${serviceProvider?.name} (${serviceProviderRange})`
            : "No service provider"
        }
        link={
          serviceProvider
            ? `/controllable_unit/${controllableUnit?.id}/service_provider`
            : undefined
        }
        linkText={serviceProvider ? "See all contracts" : undefined}
      />
      <LabelValue
        labelKey="accounting_point_balance_responsible_party.balance_responsible_party_id"
        value={
          balanceResponsibleParty?.name ? (
            balanceResponsibleParty?.name
          ) : (
            <span>No balance responsible party</span>
          )
        }
        link={
          balanceResponsibleParty
            ? `/controllable_unit/${controllableUnit?.id}/balance_responsible_party`
            : undefined
        }
        linkText={
          balanceResponsibleParty
            ? "See all balance responsible parties"
            : undefined
        }
      />
    </div>
  );
};

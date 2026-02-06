import { Link as RouterLink } from "react-router-dom";
import { LabelValue } from "../../../components/LabelValue";
import { ControllableUnitShowViewModel } from "../useControllableUnitViewModel";
import { Link } from "../../../components/ui";
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
    <div className="flex flex-col gap-2">
      <LabelValue
        label="Accounting point"
        value={`${accountingPoint?.business_id} (${systemOperator?.name})`}
      />
      <div className="flex flex-row gap-2 items-center">
        <LabelValue
          label="Service provider"
          value={
            serviceProvider
              ? `${serviceProvider?.name} (${serviceProviderRange})`
              : "No service provider"
          }
        />
        <Link
          to={`/controllable_unit/${controllableUnit?.id}/service_provider`}
          as={RouterLink}
        >
          See all contracts
        </Link>
      </div>
      <div className="flex flex-row gap-2 items-center">
        <LabelValue
          labelKey="accounting_point_balance_responsible_party.balance_responsible_party_id"
          value={
            balanceResponsibleParty
              ? `${balanceResponsibleParty?.name}`
              : "No balance responsible party"
          }
        />
        <Link
          to={`/controllable_unit/${controllableUnit?.id}/balance_responsible_party`}
          as={RouterLink}
        >
          See all balance responsible parties
        </Link>
      </div>
    </div>
  );
};

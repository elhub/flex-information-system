import { formatDate } from "date-fns";
import { useTranslate } from "ra-core";
import { Link as RouterLink } from "react-router-dom";
import { LabelValue } from "../../components/LabelValue";
import { Link, Panel } from "../../components/ui";
import type { ControllableUnitShowViewModel } from "./useControllableUnitViewModel";

const formatRange = (start?: string, end?: string) => {
  if (!start) return undefined;
  if (!end) return `${formatDate(start, "dd.MM.yyyy")} - present`;
  return `${formatDate(start, "dd.MM.yyyy")} - ${formatDate(end, "dd.MM.yyyy")}`;
};

export const ControllableUnitOverview = ({
  viewModel,
}: {
  viewModel: ControllableUnitShowViewModel;
}) => {
  const {
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
    <Panel border className="p-4 sm:p-5">
      <div className="grid gap-5 sm:grid-cols-2">
        <LabelValue
          label="Accounting point"
          value={
            accountingPoint ? (
              <Link
                as={RouterLink}
                to={`/accounting_point/${accountingPoint.id}/show`}
              >
                {systemOperator
                  ? `${accountingPoint.business_id} (${systemOperator.name})`
                  : accountingPoint.business_id}
              </Link>
            ) : undefined
          }
        />
        <LabelValue label="Metering grid area" value={meteringGridArea?.name} />
        <LabelValue
          label="Bidding zone"
          value={
            biddingZone
              ? translate(
                  `enum.accounting_point_bidding_zone.bidding_zone.${biddingZone}`,
                )
              : "-"
          }
        />
        <LabelValue label="Energy supplier" value={energySupplier?.name} />
        <LabelValue
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
          label="Balance responsible party"
          value={
            balanceResponsibleParty
              ? balanceResponsiblePartyRange
                ? `${balanceResponsibleParty.name} (${balanceResponsiblePartyRange})`
                : balanceResponsibleParty.name
              : "No balance responsible party"
          }
        />
      </div>
    </Panel>
  );
};

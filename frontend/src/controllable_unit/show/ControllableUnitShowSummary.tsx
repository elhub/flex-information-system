import { Button, Panel } from "../../components/ui";
import { LabelValue } from "../../components/LabelValue";
import type { ControllableUnitShowViewModel } from "./useControllableUnitViewModel";
import { formatDate } from "date-fns";
import { IconPencil } from "@elhub/ds-icons";
import { usePermissions, useTranslate } from "ra-core";
import { Link as RouterLink } from "react-router-dom";
import { Permissions } from "../../auth/permissions";

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
    accountingPointBalanceResponsibleParty,
    accountingPoint,
    systemOperator,
    biddingZone,
  } = viewModel;

  const translate = useTranslate();
  const { permissions } = usePermissions<Permissions>();
  const canEdit = permissions?.allow("controllable_unit", "update");
  const canReadHistory = permissions?.allow(
    "controllable_unit_history",
    "read",
  );
  const canReadEvents = permissions?.allow("event", "read");
  const serviceProviderRange = formatRange(
    controllableUnitServiceProvider?.valid_from,
    controllableUnitServiceProvider?.valid_to,
  );
  const balanceResponsiblePartyRange = formatRange(
    accountingPointBalanceResponsibleParty?.valid_from,
    accountingPointBalanceResponsibleParty?.valid_to,
  );
  const eventFilter =
    "?filter=" +
    encodeURIComponent(
      JSON.stringify({
        "source@like": `/controllable_unit/${controllableUnit.id}`,
      }),
    );

  return (
    <div className="flex flex-col gap-4">
      <Panel
        border
        className="bg-semantic-background-alternative h-fit p-4 sm:p-5"
      >
        {canEdit && (
          <div className="flex justify-end">
            <Button
              as={RouterLink}
              to={`/controllable_unit/${controllableUnit.id}/edit`}
              variant="invisible"
              icon={IconPencil}
            >
              Edit
            </Button>
          </div>
        )}
        <div className="flex flex-col gap-4">
          <LabelValue
            size="small"
            labelKey="controllable_unit.id"
            value={controllableUnit.id}
          />
          <LabelValue
            size="small"
            labelKey="controllable_unit.business_id"
            value={controllableUnit.business_id}
          />
          <LabelValue
            size="small"
            label="Accounting point"
            value={
              accountingPoint && systemOperator
                ? `${accountingPoint.business_id} (${systemOperator.name})`
                : undefined
            }
          />
          <LabelValue
            size="small"
            labelKey="accounting_point_bidding_zone.bidding_zone"
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
            link={
              serviceProvider
                ? `/controllable_unit/${controllableUnit.id}/service_provider`
                : undefined
            }
            linkText={serviceProvider ? "See all contracts" : undefined}
          />
          <LabelValue
            size="small"
            labelKey="accounting_point_balance_responsible_party.balance_responsible_party_id"
            value={
              balanceResponsibleParty
                ? balanceResponsiblePartyRange
                  ? `${balanceResponsibleParty.name} (${balanceResponsiblePartyRange})`
                  : balanceResponsibleParty.name
                : "No balance responsible party"
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
            size="small"
            tooltip
            labelKey="controllable_unit.maximum_active_power"
            value={controllableUnit.maximum_active_power}
            unit="kW"
          />
          <LabelValue
            size="small"
            tooltip
            labelKey="controllable_unit.regulation_direction"
            value={controllableUnit.regulation_direction}
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
      <div className="flex items-center gap-2">
        {canReadHistory && (
          <Button
            as={RouterLink}
            to={`/controllable_unit/${controllableUnit.id}/history`}
            variant="invisible"
          >
            View History
          </Button>
        )}
        {canReadEvents && (
          <Button
            as={RouterLink}
            to={`/event${eventFilter}`}
            variant="invisible"
          >
            View Events
          </Button>
        )}
      </div>
    </div>
  );
};

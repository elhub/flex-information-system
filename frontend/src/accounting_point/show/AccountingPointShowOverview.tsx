import { Link as RouterLink } from "react-router-dom";
import { IconCheckCircle, IconWarningCircle } from "@elhub/ds-icons";
import { useTranslate } from "ra-core";
import {
  Badge,
  BodyText,
  Heading,
  Link,
  Loader,
  Panel,
} from "../../components/ui";
import { LabelValue } from "../../components/LabelValue";
import { AccountingPointGridLocation } from "../../generated-client";
import { useAccountingPointControllableUnits } from "./useAccountingPointControllableUnits";

type Props = {
  accountingPointId: number;
  gridLocation: AccountingPointGridLocation | undefined;
  canViewControllableUnits: boolean;
  canViewLocationTab: boolean;
};

export const AccountingPointShowOverview = ({
  accountingPointId,
  gridLocation,
  canViewControllableUnits,
  canViewLocationTab,
}: Props) => {
  const translate = useTranslate();
  const { data, isLoading, error } = useAccountingPointControllableUnits(
    canViewControllableUnits ? accountingPointId : undefined,
  );

  if (error) {
    throw error;
  }

  const hasGridLocation = gridLocation != null;
  const gridLocationStatus = hasGridLocation
    ? translate(
        `text.accounting_point_grid_location_panel.status.${gridLocation.quality.toLowerCase()}`,
      )
    : translate("text.accounting_point_grid_location_panel.status.missing");
  const isConfirmed = gridLocation?.quality.toLowerCase() === "confirmed";
  const statusBadge = !gridLocation
    ? { status: "failed" as const, icon: IconWarningCircle }
    : isConfirmed
      ? { status: "approved" as const, icon: IconCheckCircle }
      : { status: "approved-with-warning" as const, icon: IconWarningCircle };

  const rows = data?.rows ?? [];
  const cuCount = rows.length;
  const totalFlexiblePower = rows.reduce(
    (sum, row) => sum + row.maximum_active_power,
    0,
  );
  const totalRatedPower = rows.reduce(
    (sum, row) => sum + (row.rated_power ?? 0),
    0,
  );

  return (
    <div className="flex flex-col gap-4">
      <Panel border className="h-fit p-4 sm:p-5 flex flex-col gap-2">
        <Heading size="small">
          {translate("text.ap_show_overview.grid_location.heading")}
        </Heading>
        <BodyText>
          {translate("text.ap_show_overview.grid_location.description")}
        </BodyText>
        <BodyText>
          {translate("text.ap_show_overview.grid_location.guessed_help_before")}{" "}
          <b>
            {translate(
              "text.accounting_point_grid_location_panel.status.guessed",
            )}
          </b>{" "}
          {translate("text.ap_show_overview.grid_location.guessed_help_after")}
        </BodyText>
        <BodyText>
          {hasGridLocation
            ? translate("text.ap_show_overview.grid_location.with_selection")
            : translate(
                "text.ap_show_overview.grid_location.without_selection",
              )}
        </BodyText>
        <div className="flex flex-col gap-2">
          <BodyText>
            <b>
              {translate("text.ap_show_overview.grid_location.current_status")}:
            </b>
          </BodyText>
          <div>
            <Badge
              size="small"
              status={statusBadge.status}
              variant="block"
              icon={statusBadge.icon}
              className="whitespace-nowrap"
            >
              {gridLocationStatus}
            </Badge>
          </div>
        </div>
        {canViewLocationTab ? (
          <Link
            as={RouterLink}
            to={`/accounting_point/${accountingPointId}/show?tab=location`}
          >
            {translate("text.ap_show_overview.grid_location.open_location_tab")}
          </Link>
        ) : (
          <BodyText className="text-semantic-text-secondary">
            {translate(
              "text.ap_show_overview.grid_location.no_location_access",
            )}
          </BodyText>
        )}
      </Panel>

      <Panel border className="h-fit p-4 sm:p-5 flex flex-col gap-4">
        <Heading size="large">
          {translate("text.ap_show_overview.cu_summary.heading")}
        </Heading>
        <BodyText>
          {translate("text.ap_show_overview.cu_summary.description", {
            count: isLoading ? "-" : cuCount,
          })}
        </BodyText>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          <LabelValue
            label={translate(
              "text.ap_show_overview.cu_summary.total_flexible_power",
            )}
            value={
              canViewControllableUnits ? (
                isLoading ? (
                  <Loader />
                ) : (
                  `${totalFlexiblePower} kW`
                )
              ) : (
                translate("text.ap_show_overview.common.not_available")
              )
            }
          />
          <LabelValue
            label={translate(
              "text.ap_show_overview.cu_summary.total_rated_power",
            )}
            value={
              canViewControllableUnits ? (
                isLoading ? (
                  <Loader />
                ) : (
                  `${totalRatedPower} kW`
                )
              ) : (
                translate("text.ap_show_overview.common.not_available")
              )
            }
          />
        </div>
      </Panel>
    </div>
  );
};

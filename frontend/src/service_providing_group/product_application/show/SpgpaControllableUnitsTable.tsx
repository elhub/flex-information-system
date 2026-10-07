import {
  BodyText,
  FormItem,
  FormItemLabel,
  Loader,
  SummaryCard,
  Badge,
  Search,
  Switch,
  Tooltip,
  TimelineSlider,
} from "../../../components/ui";
import { Column, SimpleTable } from "../../../components/SimpleTable";
import {
  type SpgpaControllableUnitRow,
  useSpgpaControllableUnits,
} from "./useSpgpaControllableUnits";
import { useTranslate } from "ra-core";
import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslateField } from "../../../intl/intl";
import {
  IconClockCircle,
  IconCross,
  IconValidationCheck,
} from "@elhub/ds-icons";
import { RegulationDirectionIcon } from "../../../controllable_unit/RegulationDirectionField";
import {
  ControllableUnitRegulationDirection,
  ServiceProvidingGroupProductApplication,
} from "../../../generated-client";
import { formatScaled, KILO, Scale } from "../../../utils/scales";
import { cn, toDateTimeString } from "../../../util";
import { BoltIcon } from "../../../components/icons/BoltIcon";
import { TimelineCard, TimelineDateField } from "./TimelineCard";
import {
  findMilestoneLabel,
  formatValue,
  parseValue,
  useChangesTimelineMarks,
} from "./timelineUtils";

type Props = {
  spgId: number;
  spgpa: ServiceProvidingGroupProductApplication;
  powerScale: Scale;
};

export const SpgpaControllableUnitsTable = ({
  spgId,
  spgpa,
  powerScale,
}: Props) => {
  const [now] = useState(() => new Date().toISOString());
  const marks = useChangesTimelineMarks(spgpa, now);
  const [selectedDate, setSelectedDate] = useState<string>(now);
  const { data, isInitialLoading, isLoading, error } =
    useSpgpaControllableUnits(spgId, spgpa, selectedDate);
  const navigate = useNavigate();
  const t = useTranslateField();
  const translate = useTranslate();
  const [searchQuery, setSearchQuery] = useState("");
  const [hidePrequalified, setHidePrequalified] = useState(false);
  const filteredCUs = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    let result = data?.rows;
    if (q) {
      result = result?.filter(
        (cu) =>
          cu.name?.toLowerCase().includes(q) ||
          (cu.id != null && String(cu.id).includes(q)) ||
          (cu.mpid != null && String(cu.mpid).includes(q)) ||
          cu.soName?.toLowerCase().includes(q),
      );
    }
    if (hidePrequalified) {
      result = result?.filter(
        (cu) => !cu.gridPrequalifiedAt || !cu.productApplicationPrequalifiedAt,
      );
    }
    return result;
  }, [searchQuery, hidePrequalified, data?.rows]);

  const formatPower = (value: unknown) =>
    formatScaled(Number(value), "W", KILO, powerScale);

  // A unit counts as approved once both its grid prequalification and the
  // product application have been approved.
  const approvalSummary = useMemo(() => {
    if (!data) {
      return undefined;
    }
    const isApproved = (cu: SpgpaControllableUnitRow) =>
      Boolean(cu.gridPrequalifiedAt && cu.productApplicationPrequalifiedAt);
    const power = (cus: SpgpaControllableUnitRow[]) =>
      cus.reduce((sum, cu) => sum + (cu.maximum_active_power ?? 0), 0);
    const approvedCus = data.rows.filter(isApproved);
    const pendingCus = data.rows.filter((cu) => !isApproved(cu));
    const approvedPower = power(approvedCus);
    const pendingPower = power(pendingCus);
    const totalPower = approvedPower + pendingPower;
    return {
      approvedCount: approvedCus.length,
      pendingCount: pendingCus.length,
      totalCount: data.rows.length,
      approvedPower,
      pendingPower,
      totalPower,
      approvedShare: totalPower > 0 ? approvedPower / totalPower : 0,
    };
  }, [data]);

  if (isInitialLoading) {
    return <Loader />;
  }

  if (error) {
    throw error;
  }

  const columns: Column<SpgpaControllableUnitRow>[] = [
    {
      key: "name",
      header: t("controllable_unit.name"),
    },
    {
      key: "membershipRecordedAt",
      header: translate("text.spg_manage_members_column_record_time"),
      headerTooltip: translate(
        "text.spg_manage_members_column_record_time_tooltip",
      ),
      render: (value) => toDateTimeString(String(value)),
    },

    {
      key: "maximum_active_power",
      header: t("controllable_unit.maximum_active_power"),
      render: (value) => <div className="text-right">{formatPower(value)}</div>,
    },
    {
      key: "mpid",
      header: t("controllable_unit.accounting_point_id"),
      render: (value) =>
        value !== "-" ? (
          <BodyText
            size={"small"}
            onClick={(e: React.MouseEvent) => e.stopPropagation()}
          >
            {String(value)}
          </BodyText>
        ) : (
          <>{value}</>
        ),
    },
    {
      key: "soName",
      header: t("accounting_point.system_operator_id"),
    },
    {
      key: "regulation_direction",
      header: t("controllable_unit.regulation_direction"),
      render: (value) =>
        value ? (
          <RegulationDirectionIcon
            value={value as ControllableUnitRegulationDirection}
          />
        ) : null,
    },
    {
      key: "gridPrequalifiedAt",
      header: translate("text.table.header.grid_prequalification"),
      render: (value) =>
        value ? (
          <Tooltip content={toDateTimeString(String(value))}>
            <IconValidationCheck
              style={{ width: 18, height: 18 }}
              className="text-semantic-text-success"
              aria-hidden
            />
          </Tooltip>
        ) : (
          <IconCross
            style={{ width: 18, height: 18 }}
            className="text-semantic-text-error"
            aria-hidden
          />
        ),
    },
    {
      key: "productApplicationPrequalifiedAt",
      header: translate("text.table.header.product_application"),
      render: (value) =>
        value ? (
          <Tooltip content={toDateTimeString(String(value))}>
            <IconValidationCheck
              style={{ width: 18, height: 18 }}
              className="text-semantic-text-success"
              aria-hidden
            />
          </Tooltip>
        ) : (
          <IconCross
            style={{ width: 18, height: 18 }}
            className="text-semantic-text-error"
            aria-hidden
          />
        ),
    },
  ];

  return (
    <div className="flex flex-col gap-12">
      <div className="flex flex-col gap-4">
        <TimelineCard
          heading={translate("text.spgpa_snapshot_heading")}
          hint={translate("text.spgpa_snapshot_hint")}
          fields={
            <TimelineDateField
              id="spgpa-snapshot-date"
              label={translate("text.spgpa_snapshot_date_label")}
              milestoneLabel={findMilestoneLabel(
                selectedDate,
                marks,
                translate,
              )}
              selected={parseValue(selectedDate)}
              maxDate={parseValue(now)}
              onChange={(date) => {
                const formatted = formatValue(date);
                if (formatted) setSelectedDate(formatted);
              }}
            />
          }
        >
          {marks.length > 0 && (
            <TimelineSlider
              marks={marks}
              value={new Date(selectedDate).getTime()}
              onValueChange={(v) => setSelectedDate(new Date(v).toISOString())}
              label={translate("text.spgpa_snapshot_handle_label")}
              formatValueForA11y={(value) =>
                toDateTimeString(new Date(value).toISOString())
              }
            />
          )}
        </TimelineCard>
        {approvalSummary && (
          <div
            className={cn(
              "grid grid-cols-1 gap-4 transition-opacity sm:grid-cols-3",
              isLoading ? "opacity-50" : undefined,
            )}
            aria-busy={isLoading || undefined}
          >
            <SummaryCard
              label={translate("text.spgpa_snapshot_approved_flexible_power")}
              value={formatPower(approvalSummary.approvedPower)}
              icon={
                <IconValidationCheck
                  className="text-semantic-text-success"
                  aria-hidden
                />
              }
              accentClassName="border-semantic-border-success"
              trailing={
                <Badge size="small" variant="block" status="approved">
                  {`${Math.round(approvalSummary.approvedShare * 100)}%`}
                </Badge>
              }
              subtitle={translate("text.spgpa_snapshot_approved_units", {
                approved: approvalSummary.approvedCount,
                total: approvalSummary.totalCount,
              })}
            />
            <SummaryCard
              label={translate(
                "text.spgpa_snapshot_flexible_power_needing_approval",
              )}
              value={formatPower(approvalSummary.pendingPower)}
              icon={
                <IconClockCircle
                  className="text-semantic-text-information"
                  aria-hidden
                />
              }
              accentClassName="border-semantic-border-information"
              subtitle={translate("text.spgpa_snapshot_pending_units", {
                count: approvalSummary.pendingCount,
              })}
            />
            <SummaryCard
              label={translate("text.spgpa_snapshot_total_capacity")}
              value={formatPower(approvalSummary.totalPower)}
              icon={<BoltIcon className="h-4 w-4 text-semantic-text-subtle" />}
              accentClassName="border-semantic-border"
              subtitle={translate("text.spgpa_snapshot_total_units", {
                count: approvalSummary.totalCount,
              })}
            />
          </div>
        )}
      </div>
      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between gap-4">
          <div className="flex flex-1 items-center gap-4">
            <div className="w-1/2">
              <Search
                label={translate("text.spg_show_table_search_label")}
                hideLabel
                clearButtonLabel={translate("text.spg_show_table_search_clear")}
                placeholder={translate(
                  "text.spg_show_table_search_placeholder",
                )}
                value={searchQuery}
                onChange={(value) => setSearchQuery(value)}
                onClear={() => setSearchQuery("")}
              />
            </div>
            <FormItem id="hide-prequalified">
              <FormItemLabel>
                {translate("text.spgpa_hide_prequalified")}
              </FormItemLabel>
              <Switch
                checked={hidePrequalified}
                onChange={(e) => setHidePrequalified(e.target.checked)}
              />
            </FormItem>
          </div>
        </div>
        {isLoading || (filteredCUs && filteredCUs.length > 0) ? (
          <SimpleTable
            rowClick={(row) => navigate(`/controllable_unit/${row.id}/show`)}
            size="small"
            data={filteredCUs ?? []}
            columns={columns}
            className="w-full"
            loading={isLoading}
          />
        ) : (
          <BodyText>
            {translate(
              data && data.rows.length > 0
                ? "text.spgpa_no_matching_controllable_units"
                : "text.spgpa_no_controllable_units",
            )}
          </BodyText>
        )}
      </div>
    </div>
  );
};

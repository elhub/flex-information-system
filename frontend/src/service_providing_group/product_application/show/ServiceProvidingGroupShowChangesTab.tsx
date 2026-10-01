import { useMemo, useState } from "react";
import { format, formatISO, parseISO } from "date-fns";
import { tz } from "@date-fns/tz";
import { useNavigate } from "react-router-dom";
import { useTranslate, type TranslateFunction } from "ra-core";
import { useTranslateField } from "../../../intl/intl";
import { IconMinus, IconPencil, IconPlus } from "@elhub/ds-icons";
import { BoltIcon } from "../../../components/icons/BoltIcon";
import {
  BodyText,
  DateTimePicker,
  FormItem,
  FormItemLabel,
  Heading,
  Loader,
  Table,
  TimelineRangeSlider,
  ToggleGroup,
  mergeTimelineMarks,
  type TimelineMark,
} from "../../../components/ui";
import { SpgChangeRow, useSpgChangesViewModel } from "./useSpgChangesViewModel";
import { ServiceProvidingGroupProductApplication } from "../../../generated-client";
import { formatScaled, KILO, Scale } from "../../../utils/scales";
import { cn, formatDurationDHM, toDateTimeString } from "../../../util";

type Props = {
  spgId: number;
  spgpa: ServiceProvidingGroupProductApplication;
  powerScale: Scale;
};

const OSLO_TIMEZONE = "Europe/Oslo";

const parseValue = (value: string | undefined) =>
  value ? parseISO(value, { in: tz(OSLO_TIMEZONE) }) : undefined;

const formatValue = (date: Date | null) =>
  date
    ? formatISO(date, { representation: "complete", in: tz(OSLO_TIMEZONE) })
    : undefined;

const formatPower = (value: number | undefined, powerScale: Scale) =>
  value != null ? formatScaled(value, "W", KILO, powerScale) : undefined;

// Formats a power difference with an explicit "+"/"-" sign, e.g. "+1.5 kW".
const formatSignedPower = (value: number, powerScale: Scale) => {
  const formatted = formatScaled(value, "W", KILO, powerScale);
  return value > 0 ? `+${formatted}` : formatted;
};

type ChangeSummary = {
  added: number;
  removed: number;
  changed: number;
  wattDiff: number;
};

// Aggregates counts and the total flexible power difference across *all*
// rows, regardless of which statuses are currently visible in the table.
const summarizeChanges = (rows: SpgChangeRow[] | undefined): ChangeSummary =>
  (rows ?? []).reduce<ChangeSummary>(
    (summary, row) => {
      const oldPower =
        row.old?.controllable_unit_history?.[0]?.maximum_active_power ?? 0;
      const newPower =
        row.new?.controllable_unit_history?.[0]?.maximum_active_power ?? 0;
      return {
        added: summary.added + (row.status === "added" ? 1 : 0),
        removed: summary.removed + (row.status === "removed" ? 1 : 0),
        changed: summary.changed + (row.status === "changed" ? 1 : 0),
        wattDiff: summary.wattDiff + (newPower - oldPower),
      };
    },
    { added: 0, removed: 0, changed: 0, wattDiff: 0 },
  );

const getStatusLabel = (
  status: SpgChangeRow["status"],
  translate: TranslateFunction,
): string => {
  switch (status) {
    case "added":
      return translate("text.spg_changes_status_added");
    case "removed":
      return translate("text.spg_changes_status_removed");
    case "changed":
      return translate("text.spg_changes_status_changed");
    default:
      return translate("text.spg_changes_status_unchanged");
  }
};

// Label of the mark matching `value` exactly, or a "Custom" label if the
// value was set via a manual date/time input rather than picked from the
// timeline (e.g. by dragging the slider to a milestone).
const findMilestoneLabel = (
  value: string | undefined,
  marks: TimelineMark[],
  translate: TranslateFunction,
): string | undefined => {
  if (!value) return undefined;
  const match = marks.find((mark) => mark.value === new Date(value).getTime());
  return match?.label ?? translate("text.spg_changes_custom_milestone");
};

// Builds the timeline marks for the SPGPA's lifecycle milestones (skipping
// any that are unset) plus "now", each labeled and formatted for display.
const useChangesTimelineMarks = (
  spgpa: ServiceProvidingGroupProductApplication,
  now: string,
): TimelineMark[] => {
  const translate = useTranslate();
  const translateField = useTranslateField();

  return useMemo(() => {
    const milestones: { at: string | undefined; label: string }[] = [
      {
        at: spgpa.created_at,
        label: translateField(
          "service_providing_group_product_application.created_at",
        ),
      },
      {
        at: spgpa.prequalified_at,
        label: translateField(
          "service_providing_group_product_application.prequalified_at",
        ),
      },
      {
        at: spgpa.verified_at,
        label: translateField(
          "service_providing_group_product_application.verified_at",
        ),
      },
      {
        at: spgpa.complete_at,
        label: translateField(
          "service_providing_group_product_application.complete_at",
        ),
      },
      { at: now, label: translate("text.spg_changes_milestone_now") },
    ];

    const mappedMilestones = milestones
      .filter((milestone): milestone is { at: string; label: string } =>
        Boolean(milestone.at),
      )
      .map((milestone) => ({
        value: new Date(milestone.at).getTime(),
        label: milestone.label,
      }));

    return mergeTimelineMarks(mappedMilestones).map((mark) => ({
      ...mark,
      sublabel: format(new Date(mark.value), "dd.MM.yyyy HH:mm", {
        in: tz(OSLO_TIMEZONE),
      }),
    }));
  }, [spgpa, now, translate, translateField]);
};

const rowClassName = (status: SpgChangeRow["status"]) => {
  switch (status) {
    case "added":
      return "bg-semantic-background-success";
    case "removed":
      return "bg-semantic-background-error";
    case "changed":
      return "bg-semantic-background-information";
    default:
      return "bg-semantic-background";
  }
};

const StatusMarker = ({
  status,
  label,
}: {
  status: SpgChangeRow["status"];
  label: string;
}) => {
  const icon = (() => {
    if (status === "added") {
      return <IconPlus className="text-semantic-text-success" aria-hidden />;
    }
    if (status === "removed") {
      return <IconMinus className="text-semantic-text-error" aria-hidden />;
    }
    if (status === "changed") {
      return (
        <IconPencil className="text-semantic-text-information" aria-hidden />
      );
    }
    return null;
  })();

  return (
    <>
      {icon}
      <span className="sr-only">{label}</span>
    </>
  );
};

const DiffText = ({
  oldValue,
  newValue,
  status,
}: {
  oldValue: string | undefined;
  newValue: string | undefined;
  status: SpgChangeRow["status"];
}) => {
  if (status === "added") {
    return <span className="text-semantic-text-success">{newValue}</span>;
  }
  if (status === "removed") {
    return <span className="text-semantic-text-error">{oldValue}</span>;
  }
  if (status === "changed" && oldValue !== newValue) {
    return (
      <span>
        <span className="text-semantic-text-error line-through mr-1">
          {oldValue}
        </span>
        <span className="text-semantic-text-success">{newValue}</span>
      </span>
    );
  }
  return <span>{newValue ?? oldValue}</span>;
};

// A read-only stat box showing an aggregate count/value for the current
// comparison period, with a colored accent matching the status colors used
// elsewhere on this tab.
const ChangeSummaryBox = ({
  label,
  value,
  icon,
  accentClassName,
}: {
  label: string;
  value: string;
  icon: React.ReactNode;
  accentClassName: string;
}) => (
  <div
    className={cn(
      "flex flex-col gap-1 rounded-lg border-l-4 bg-semantic-background p-4",
      accentClassName,
    )}
  >
    <div className="flex items-center gap-2">
      {icon}
      <BodyText size="small" className="text-semantic-text-subtle">
        {label}
      </BodyText>
    </div>
    <Heading level={4} size="small">
      {value}
    </Heading>
  </div>
);

// A labeled date/time field for the "from"/"to" endpoints of the changes
// range, showing which milestone (if any) the current value matches.
const ChangesDateField = ({
  id,
  label,
  milestoneLabel,
  selected,
  minDate,
  maxDate,
  onChange,
}: {
  id: string;
  label: string;
  milestoneLabel: string | undefined;
  selected: Date | undefined;
  minDate?: Date;
  maxDate?: Date;
  onChange: (date: Date | null) => void;
}) => (
  <FormItem id={id} size="large">
    <FormItemLabel htmlFor={id}>{label}</FormItemLabel>
    <span className="text-xs font-semibold text-semantic-text-success">
      {milestoneLabel}
    </span>
    <DateTimePicker
      id={id}
      selected={selected}
      minDate={minDate}
      maxDate={maxDate}
      onChange={onChange}
      size="large"
      navigateButtons={false}
      fixedPopperPosition
    />
  </FormItem>
);

export const ServiceProvidingGroupShowChangesTab = ({
  spgId,
  spgpa,
  powerScale,
}: Props) => {
  const translate = useTranslate();
  const navigate = useNavigate();
  const [now] = useState(() => new Date().toISOString());
  const marks = useChangesTimelineMarks(spgpa, now);

  const [from, setFrom] = useState<string | undefined>(() => {
    const secondToLast = marks[marks.length - 2];
    return secondToLast
      ? new Date(secondToLast.value).toISOString()
      : spgpa.created_at;
  });
  const [to, setTo] = useState<string | undefined>(now);
  const [visibleStatuses, setVisibleStatuses] = useState<string[]>([
    "added",
    "removed",
    "changed",
  ]);

  const {
    data: rows,
    isLoading,
    isFetching,
    error,
  } = useSpgChangesViewModel(spgId, from, to);
  const visibleRows = rows?.filter((row) =>
    visibleStatuses.includes(row.status),
  );
  const summary = useMemo(() => summarizeChanges(rows), [rows]);
  const showLoader = isLoading || isFetching;

  const handleRangeChange = ([newFrom, newTo]: [number, number]) => {
    setFrom(new Date(newFrom).toISOString());
    setTo(new Date(newTo).toISOString());
  };

  return (
    <div className="flex flex-col gap-[50px]">
      <div className="flex flex-col gap-4">
        <div className="flex flex-col gap-4 rounded-lg border border-semantic-border bg-semantic-background p-6">
          <div className="flex flex-col gap-2">
            <Heading level={3} size="small">
              {translate("text.spg_changes_period_heading")}
            </Heading>

            <BodyText size="small" className="text-semantic-text-subtle">
              {translate("text.spg_changes_period_hint")}
            </BodyText>
          </div>

          <div className="flex items-end gap-4">
            <ChangesDateField
              id="spg-changes-from"
              label={translate("text.spg_changes_from_label")}
              milestoneLabel={findMilestoneLabel(from, marks, translate)}
              selected={parseValue(from)}
              maxDate={parseValue(to)}
              onChange={(date) => setFrom(formatValue(date))}
            />

            {from && to && (
              <BodyText
                size="small"
                className="mb-2 rounded-full bg-semantic-background-success px-3 py-1 text-semantic-text-success"
              >
                {formatDurationDHM(from, to)}
              </BodyText>
            )}

            <ChangesDateField
              id="spg-changes-to"
              label={translate("text.spg_changes_to_label")}
              milestoneLabel={findMilestoneLabel(to, marks, translate)}
              selected={parseValue(to)}
              minDate={parseValue(from)}
              onChange={(date) => setTo(formatValue(date))}
            />
          </div>

          {marks.length > 0 && (
            <TimelineRangeSlider
              marks={marks}
              value={[
                from ? new Date(from).getTime() : marks[0].value,
                to ? new Date(to).getTime() : marks[marks.length - 1].value,
              ]}
              onValueChange={handleRangeChange}
              fromLabel={translate("text.spg_changes_from_label")}
              toLabel={translate("text.spg_changes_to_label")}
              formatValueForA11y={(value) =>
                toDateTimeString(new Date(value).toISOString())
              }
            />
          )}
        </div>

        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          <ChangeSummaryBox
            label={translate("text.spg_changes_status_added")}
            value={String(summary.added)}
            icon={
              <IconPlus className="text-semantic-text-success" aria-hidden />
            }
            accentClassName="border-semantic-border-success"
          />
          <ChangeSummaryBox
            label={translate("text.spg_changes_status_removed")}
            value={String(summary.removed)}
            icon={
              <IconMinus className="text-semantic-text-error" aria-hidden />
            }
            accentClassName="border-semantic-border-error"
          />
          <ChangeSummaryBox
            label={translate("text.spg_changes_status_changed")}
            value={String(summary.changed)}
            icon={
              <IconPencil
                className="text-semantic-text-information"
                aria-hidden
              />
            }
            accentClassName="border-semantic-border-information"
          />
          <ChangeSummaryBox
            label={translate("text.spg_changes_summary_power_diff")}
            value={formatSignedPower(summary.wattDiff, powerScale)}
            icon={<BoltIcon className="h-4 w-4 text-semantic-text-subtle" />}
            accentClassName="border-semantic-border"
          />
        </div>
      </div>

      <div className="flex flex-col gap-4">
        <ToggleGroup
          type="multiple"
          value={visibleStatuses}
          defaultValue={visibleStatuses}
          onChange={(value) => setVisibleStatuses(value ?? [])}
        >
          <ToggleGroup.Item value="added">
            {translate("text.spg_changes_status_added")}
          </ToggleGroup.Item>
          <ToggleGroup.Item value="removed">
            {translate("text.spg_changes_status_removed")}
          </ToggleGroup.Item>
          <ToggleGroup.Item value="changed">
            {translate("text.spg_changes_status_changed")}
          </ToggleGroup.Item>
          <ToggleGroup.Item value="unchanged">
            {translate("text.spg_changes_status_unchanged")}
          </ToggleGroup.Item>
        </ToggleGroup>

        {showLoader && (
          <div className="flex w-full justify-center py-8">
            <Loader size="medium" />
          </div>
        )}
        {error ? (
          <BodyText className="text-semantic-background-action-danger">
            {translate("text.spg_changes_error")}
          </BodyText>
        ) : null}

        {!showLoader &&
          !error &&
          (!visibleRows || visibleRows.length === 0) && (
            <BodyText>{translate("text.spg_changes_empty")}</BodyText>
          )}

        {!showLoader && !error && visibleRows && visibleRows.length > 0 && (
          <Table size="small" className="w-full">
            <Table.Header>
              <Table.Row>
                <Table.ColumnHeader
                  scope="col"
                  aria-label={translate("text.spg_changes_column_status")}
                />
                <Table.ColumnHeader scope="col">
                  {translate("text.spg_changes_column_id")}
                </Table.ColumnHeader>
                <Table.ColumnHeader scope="col">
                  {translate("text.spg_changes_column_name")}
                </Table.ColumnHeader>
                <Table.ColumnHeader scope="col">
                  {translate("text.spg_changes_column_map")}
                </Table.ColumnHeader>
                <Table.ColumnHeader scope="col">
                  {translate("text.spg_changes_column_first_change")}
                </Table.ColumnHeader>
                <Table.ColumnHeader scope="col">
                  {translate("text.spg_changes_column_last_change")}
                </Table.ColumnHeader>
              </Table.Row>
            </Table.Header>
            <Table.Body>
              {visibleRows.map((row) => {
                const oldCu = row.old?.controllable_unit_history?.[0];
                const newCu = row.new?.controllable_unit_history?.[0];
                return (
                  <Table.Row
                    key={row.id}
                    className={cn(rowClassName(row.status), "cursor-pointer")}
                    onClick={(e) => {
                      const target = e.target as HTMLElement;
                      if (target.closest("button, a, .eds-modal__overlay")) {
                        return;
                      }
                      navigate(`/controllable_unit/${row.id}/show`);
                    }}
                  >
                    <Table.DataCell>
                      <StatusMarker
                        status={row.status}
                        label={getStatusLabel(row.status, translate)}
                      />
                    </Table.DataCell>
                    <Table.DataCell>{row.id}</Table.DataCell>
                    <Table.DataCell>
                      <DiffText
                        oldValue={oldCu?.name}
                        newValue={newCu?.name}
                        status={row.status}
                      />
                    </Table.DataCell>
                    <Table.DataCell>
                      <DiffText
                        oldValue={formatPower(
                          oldCu?.maximum_active_power,
                          powerScale,
                        )}
                        newValue={formatPower(
                          newCu?.maximum_active_power,
                          powerScale,
                        )}
                        status={row.status}
                      />
                    </Table.DataCell>
                    <Table.DataCell>
                      {toDateTimeString(row.firstChange)}
                    </Table.DataCell>
                    <Table.DataCell>
                      {toDateTimeString(row.lastChange)}
                    </Table.DataCell>
                  </Table.Row>
                );
              })}
            </Table.Body>
          </Table>
        )}
      </div>
    </div>
  );
};

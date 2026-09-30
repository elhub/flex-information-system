import { ReactNode } from "react";
import { useTranslate } from "ra-core";
import { IconClockCircle, IconPencil, IconUser } from "@elhub/ds-icons";
import { BodyText, Tag, Loader, type TagVariant } from "../../../components/ui";
import { cn, toDateTimeString } from "../../../util";
import { formatScaled, KILO, Scale } from "../../../utils/scales";
import {
  ControllableUnitHistoryWithNames,
  SpgChangeRow,
  useControllableUnitHistory,
  useIdentityMap,
} from "./useSpgChangesViewModel";
import { ControllableUnitHistory, Identity } from "../../../generated-client";

type Props = {
  controllableUnitId: number;
  spgChangeRow: SpgChangeRow;
  from: string | undefined;
  to: string | undefined;
  powerScale: Scale;
};

type ChangeLogEntryKind =
  "property" | "membershipAdded" | "membershipRemoved" | "membershipValidity";

type ChangeLogEntry = {
  id: string;
  kind: ChangeLogEntryKind;
  timestamp: string;
  changedBy: string;
  property: string | undefined;
  previousValue: ReactNode;
  newValue: ReactNode;
  newBadge?: { label: string; variant: TagVariant };
};

const accentClassByKind: Record<ChangeLogEntryKind, string> = {
  property: "border-semantic-border-information",
  membershipAdded: "border-semantic-border-success",
  membershipRemoved: "border-semantic-border-error",
  membershipValidity: "border-semantic-border-information",
};

const iconByKind: Record<ChangeLogEntryKind, typeof IconPencil> = {
  property: IconPencil,
  membershipAdded: IconUser,
  membershipRemoved: IconUser,
  membershipValidity: IconClockCircle,
};

const formatPower = (value: number | undefined, powerScale: Scale) =>
  value != null ? formatScaled(value, "W", KILO, powerScale) : undefined;

const createSpgMembershipChangeLogEntry = (
  spgChangeRow: SpgChangeRow,
  identityMap: Record<number, Identity>,
): ChangeLogEntry[] => {
  const oldValidFrom = spgChangeRow.old?.valid_from;
  const oldValidTo = spgChangeRow.old?.valid_to;
  const newValidFrom = spgChangeRow.new?.valid_from;
  const newValidTo = spgChangeRow.new?.valid_to;
  if (oldValidFrom === newValidFrom && oldValidTo === newValidTo) return [];

  const hasOldValidity = oldValidFrom || oldValidTo;
  const hasNewValidity = newValidFrom || newValidTo;
  const kind = !hasOldValidity
    ? "membershipAdded"
    : !hasNewValidity
      ? "membershipRemoved"
      : "membershipValidity";

  return [
    {
      id: kind,
      kind: kind,
      timestamp: spgChangeRow.new?.recorded_at ?? "",
      changedBy: spgChangeRow.new?.recorded_by
        ? (identityMap[spgChangeRow.new?.recorded_by]?.party_name ?? "-")
        : "-",
      property: undefined,
      previousValue: (
        <span className="text-semantic-text-error line-through">
          {toDateTimeString(oldValidFrom)} → {toDateTimeString(oldValidTo)}
        </span>
      ),
      newValue: (
        <span>
          {toDateTimeString(newValidFrom)} → {toDateTimeString(newValidTo)}
        </span>
      ),
      newBadge: undefined,
    },
  ];
};

const findLatestChangeForPropertyWithValue = (
  prop: keyof ControllableUnitHistory,
  value: any,
  history: ControllableUnitHistoryWithNames[],
): ControllableUnitHistoryWithNames | null => {
  if (!history) return null;
  const sortedHistory = history.sort(function (a, b) {
    return (
      new Date(a.recorded_at).getTime() - new Date(b.recorded_at).getTime()
    );
  });
  for (let i = sortedHistory.length - 1; i > 0; i--) {
    if (
      sortedHistory[i][prop] === value &&
      sortedHistory[i - 1][prop] !== value
    )
      return sortedHistory[i];
  }
  return null;
};

const createValueChangeLogEntries = (
  spgChangeRow: SpgChangeRow,
  history: ControllableUnitHistoryWithNames[],
  powerScale: Scale,
): ChangeLogEntry[] => {
  const oldCu = spgChangeRow.old?.controllable_unit_history?.[0];
  const newCu = spgChangeRow.new?.controllable_unit_history?.[0];
  if (!oldCu || !newCu) return [];

  const properties = [
    "name",
    "status",
    "maximum_active_power",
    "regulation_direction",
  ].map((prop) => prop as keyof ControllableUnitHistory);

  const logEntries: ChangeLogEntry[] = [];
  properties.forEach((prop) => {
    if (oldCu[prop] !== newCu[prop]) {
      const latestChangeToCurrentValue = findLatestChangeForPropertyWithValue(
        prop,
        newCu[prop],
        history,
      );
      const oldValue =
        prop === "maximum_active_power"
          ? formatPower(oldCu[prop], powerScale)
          : String(oldCu[prop]);
      const newValue =
        prop === "maximum_active_power"
          ? formatPower(newCu[prop], powerScale)
          : String(newCu[prop]);
      logEntries.push({
        id: "property-" + prop,
        kind: "property",
        timestamp: latestChangeToCurrentValue?.recorded_at ?? newCu.recorded_at,
        changedBy: latestChangeToCurrentValue?.replaced_by_name
          ? latestChangeToCurrentValue?.replaced_by_name
          : (latestChangeToCurrentValue?.recorded_by_name ?? "-"),
        property: prop.toString(),
        previousValue: (
          <span className="text-semantic-text-error line-through">
            {oldValue}
          </span>
        ),
        newValue: <span>{newValue}</span>,
        newBadge: undefined,
      });
    }
  });

  return logEntries;
};

const ChangeLogCard = ({ entry }: { entry: ChangeLogEntry }) => {
  const translate = useTranslate();
  const Icon = iconByKind[entry.kind];

  const categoryLabel = translate(
    `text.spg_changes_log_${entry.kind}_category`,
    { property: translate("field.controllable_unit." + entry.property) },
  );
  const changedByLabel = translate(`text.spg_changes_log_changed_by_label`);
  const previousLabel = translate(
    `text.spg_changes_log_${entry.kind}_previous_label`,
  );
  const newLabel = translate(`text.spg_changes_log_${entry.kind}_new_label`);

  return (
    <div
      className={cn(
        "flex flex-col gap-3 rounded-lg border-l-4 bg-semantic-background pt-4 px-4",
        accentClassByKind[entry.kind],
      )}
    >
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <Tag size="small">
            <span className="flex items-center gap-1">
              <Icon aria-hidden />
              {categoryLabel}
            </span>
          </Tag>
          <BodyText size="small" className="text-semantic-text-subtle">
            {toDateTimeString(entry.timestamp)}
          </BodyText>
        </div>
        <BodyText size="small" className="text-semantic-text-subtle">
          {changedByLabel}:{" "}
          <span className="font-semibold text-semantic-text">
            {entry.changedBy}
          </span>
        </BodyText>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <div className="rounded-md bg-semantic-background-action-selected p-3">
          <BodyText
            size="small"
            weight="bold"
            className="mb-1 uppercase text-semantic-text-subtle"
          >
            {previousLabel}
          </BodyText>
          <div className="flex flex-wrap items-center gap-2">
            {entry.previousValue}
          </div>
        </div>
        <div className="rounded-md bg-semantic-background-action-selected p-3">
          <BodyText
            size="small"
            weight="bold"
            className="mb-1 uppercase text-semantic-text-subtle"
          >
            {newLabel}
          </BodyText>
          <div className="flex flex-wrap items-center gap-2">
            {entry.newValue}
            {entry.newBadge && (
              <Tag size="small" variant={entry.newBadge.variant}>
                {entry.newBadge.label}
              </Tag>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export const ControllableUnitDiff = ({
  controllableUnitId,
  spgChangeRow,
  from,
  to,
  powerScale,
}: Props) => {
  const translate = useTranslate();

  const {
    data: history,
    isLoading,
    error,
  } = useControllableUnitHistory(controllableUnitId);

  const membershipIdentityMap = useIdentityMap(
    [spgChangeRow.new?.recorded_by, spgChangeRow.new?.replaced_by].filter(
      (id): id is number => id !== undefined && id !== null,
    ),
  );

  const entries = [
    ...createValueChangeLogEntries(spgChangeRow, history ?? [], powerScale),
    ...createSpgMembershipChangeLogEntry(spgChangeRow, membershipIdentityMap),
  ];

  return (
    <div className="flex flex-col gap-4 p-1">
      <div className="flex flex-col gap-1">
        <BodyText size="small" className="text-semantic-text-subtle">
          {translate("text.spg_changes_comparison_scope")}:{" "}
          {toDateTimeString(from)} — {toDateTimeString(to)}
        </BodyText>
      </div>

      {isLoading && (
        <div className="flex w-full justify-center py-8">
          <Loader size="medium" />
        </div>
      )}
      {error ? (
        <BodyText className="text-semantic-background-action-danger">
          {translate("text.spg_changes_error")}
        </BodyText>
      ) : null}
      {!isLoading && !error && (
        <div className="flex flex-col gap-3">
          {entries.map((entry) => (
            <ChangeLogCard key={entry.id} entry={entry} />
          ))}
        </div>
      )}
    </div>
  );
};

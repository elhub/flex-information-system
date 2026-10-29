import { useMemo } from "react";
import { format, formatISO, parseISO } from "date-fns";
import { tz } from "@date-fns/tz";
import type { TranslateFunction } from "ra-core";
import { mergeTimelineMarks, type TimelineMark } from "../../../components/ui";

export const OSLO_TIMEZONE = "Europe/Oslo";

export const parseValue = (value: string | undefined) =>
  value ? parseISO(value, { in: tz(OSLO_TIMEZONE) }) : undefined;

export const formatValue = (date: Date | null) =>
  date
    ? formatISO(date, { representation: "complete", in: tz(OSLO_TIMEZONE) })
    : undefined;

// Label of the mark matching `value` exactly, or a "Custom" label if the
// value was set via a manual date/time input rather than picked from the
// timeline (e.g. by dragging the slider to a milestone).
export const findMilestoneLabel = (
  value: string | undefined,
  marks: TimelineMark[],
  translate: TranslateFunction,
): string | undefined => {
  if (!value) return undefined;
  const match = marks.find((mark) => mark.value === new Date(value).getTime());
  return match?.label ?? translate("text.spg_changes_custom_milestone");
};

export type TimelineMilestone = { at: string | undefined; label: string };

// Builds the timeline marks for the given milestones (skipping any that are
// unset), each labeled and formatted for display.
export const useTimelineMarks = (
  milestones: TimelineMilestone[],
): TimelineMark[] =>
  useMemo(() => {
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
  }, [milestones]);

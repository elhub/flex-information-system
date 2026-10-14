import { useMemo } from "react";
import { format, formatISO, parseISO } from "date-fns";
import { tz } from "@date-fns/tz";
import { useTranslate, type TranslateFunction } from "ra-core";
import { useTranslateField } from "../../../intl/intl";
import { mergeTimelineMarks, type TimelineMark } from "../../../components/ui";
import { ServiceProvidingGroupProductApplication } from "../../../generated-client";

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

// Builds the timeline marks for the SPGPA's lifecycle milestones (skipping
// any that are unset) plus "now", each labeled and formatted for display.
export const useChangesTimelineMarks = (
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

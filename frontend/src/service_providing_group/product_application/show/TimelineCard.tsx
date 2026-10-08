import type { ReactNode } from "react";
import {
  BodyText,
  DateTimePicker,
  FormItem,
  FormItemLabel,
  Heading,
} from "../../../components/ui";

// Bordered card with a heading, a hint, a row of date fields and a timeline
// slider (passed as children), shared by the views that pick a point or a
// period on the SPGPA timeline.
export const TimelineCard = ({
  heading,
  hint,
  fields,
  children,
}: {
  heading: ReactNode;
  hint: ReactNode;
  fields: ReactNode;
  children?: ReactNode;
}) => (
  <div className="flex flex-col gap-4 rounded-lg border border-semantic-border bg-semantic-background p-6">
    <div className="flex flex-col gap-2">
      <Heading level={3} size="small">
        {heading}
      </Heading>

      <BodyText
        size="small"
        className="text-semantic-text-subtle whitespace-pre-line"
      >
        {hint}
      </BodyText>
    </div>

    <div className="flex items-end gap-4">{fields}</div>

    {children}
  </div>
);

// A labeled date/time field, showing which milestone (if any) the current
// value matches.
export const TimelineDateField = ({
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

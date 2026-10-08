export type TimelineMark = {
  value: number;
  label: string;
  sublabel?: string;
};

// Marks sharing the exact same timestamp are merged into a single mark,
// with their labels joined, so callers don't have to worry about duplicate
// timestamps (e.g. two milestones set at the same instant) producing
// overlapping/indistinguishable marks or duplicate React keys.
export const mergeTimelineMarks = (marks: TimelineMark[]): TimelineMark[] => {
  const byValue = new Map<number, { labels: string[]; sublabel?: string }>();
  for (const mark of marks) {
    const existing = byValue.get(mark.value);
    if (existing) {
      existing.labels.push(mark.label);
    } else {
      byValue.set(mark.value, {
        labels: [mark.label],
        sublabel: mark.sublabel,
      });
    }
  }
  return Array.from(byValue.entries())
    .map(([value, { labels, sublabel }]) => ({
      value,
      label: labels.join(" / "),
      sublabel,
    }))
    .sort((a, b) => a.value - b.value);
};

import { addMonths, addWeeks } from "date-fns";

// Processing deadline for an SPG product application: 8 weeks after it was
// requested, or 3 months after it was marked complete if not yet requested.
export const getSpgpaDeadline = (
  requestedAt?: string | null,
  completeAt?: string | null,
): string | undefined => {
  if (requestedAt) return addWeeks(new Date(requestedAt), 8).toISOString();
  if (completeAt) return addMonths(new Date(completeAt), 3).toISOString();
  return undefined;
};

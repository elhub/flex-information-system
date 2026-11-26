import { addMonths, addWeeks } from "date-fns";
import { tz } from "@date-fns/tz";

// Processing deadline for an SPG product application: 8 weeks after it was
// requested, or 3 months after it was marked complete if not yet requested.
export const getSpgpaDeadline = (
  requestedAt?: string | null,
  completeAt?: string | null,
): string | undefined => {
  if (requestedAt)
    return new Date(
      addWeeks(new Date(requestedAt), 8, {
        in: tz("Europe/Oslo"),
      }).getTime(),
    ).toISOString();
  if (completeAt)
    return new Date(
      addMonths(new Date(completeAt), 3, {
        in: tz("Europe/Oslo"),
      }).getTime(),
    ).toISOString();
  return undefined;
};

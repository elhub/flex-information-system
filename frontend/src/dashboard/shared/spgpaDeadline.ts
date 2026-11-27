import { addMonths, addWeeks } from "date-fns";
import { tz } from "@date-fns/tz";

// Processing deadline for an SPG product application: 3 months after it was
// marked complete, or, until then, 8 weeks after it was (last) requested.
// Applications created before requested_at existed have no value for it, so
// we fall back to created_at, which is also what the dashboard displays.
export const getSpgpaDeadline = (
  requestedAt?: string | null,
  completeAt?: string | null,
  createdAt?: string | null,
): string | undefined => {
  if (completeAt)
    return new Date(
      addMonths(new Date(completeAt), 3, {
        in: tz("Europe/Oslo"),
      }).getTime(),
    ).toISOString();
  const requestedOrCreatedAt = requestedAt ?? createdAt;
  if (requestedOrCreatedAt)
    return new Date(
      addWeeks(new Date(requestedOrCreatedAt), 8, {
        in: tz("Europe/Oslo"),
      }).getTime(),
    ).toISOString();
  return undefined;
};

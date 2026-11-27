import { addMonths, addWeeks } from "date-fns";
import { tz } from "@date-fns/tz";

const addInOslo = (
  date: string,
  add: typeof addWeeks | typeof addMonths,
  amount: number,
) =>
  new Date(
    add(new Date(date), amount, { in: tz("Europe/Oslo") }).getTime(),
  ).toISOString();

// Processing deadline for an SPG product application:
// - 3 months after it was marked complete, if that happened in the current
//   request round,
// - otherwise 8 weeks after it was (last) requested.
// complete_at is never cleared, so after a rejected application is requested
// again, an old complete_at (before the new requested_at) must be ignored.
// Applications created before requested_at existed have no value for it, so
// we fall back to created_at, which is also what the dashboard displays.
export const getSpgpaDeadline = (
  requestedAt?: string | null,
  completeAt?: string | null,
  createdAt?: string | null,
): string | undefined => {
  const lastRequestedAt = requestedAt ?? createdAt;

  const isCompleteInCurrentRound =
    !!completeAt &&
    (!lastRequestedAt ||
      new Date(completeAt).getTime() >= new Date(lastRequestedAt).getTime());

  if (isCompleteInCurrentRound) return addInOslo(completeAt, addMonths, 3);
  if (lastRequestedAt) return addInOslo(lastRequestedAt, addWeeks, 8);
  return undefined;
};

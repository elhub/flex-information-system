import { tz } from "@date-fns/tz";
import { isFuture, parseISO } from "date-fns";

/**
 * Checks whether product application creation is currently blocked.
 * Controlled by the VITE_PRODUCT_APPLICATION_BLOCK_BEFORE environment variable.
 * The value should be an ISO datetime string (e.g. "2026-08-17T12:00:00").
 * The datetime is interpreted as Europe/Oslo timezone (UTC+2 in summer / CEST).
 * Note: This uses a fixed +02:00 offset which is correct for dates in CEST
 * (late March through late October). For CET dates, adjust to +01:00.
 */
export function isProductApplicationBlocked(): boolean {
  const blockBefore = getEnv();
  if (!blockBefore) return false;
  const blockDate = parseISO(blockBefore, { in: tz("Europe/Oslo") });
  return isFuture(blockDate);
}

export function getProductApplicationBlockDate(): string | undefined {
  const raw = getEnv();
  if (!raw) return undefined;
  const blockDate = new Date(raw);
  return blockDate.toLocaleString("no-NO", {
    timeZone: "Europe/Oslo",
    dateStyle: "long",
    timeStyle: "short",
  });
}

const getEnv = () => {
  return (
    window.env.VITE_FLEX_PRODUCT_APPLICATION_BLOCK_BEFORE ||
    import.meta.env.VITE_FLEX_PRODUCT_APPLICATION_BLOCK_BEFORE
  );
};

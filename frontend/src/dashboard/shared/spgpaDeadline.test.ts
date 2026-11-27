import { expect, it } from "vitest";
import { getSpgpaDeadline } from "./spgpaDeadline";

// examples from the dashboard design; times are 12:00 in Europe/Oslo

it("is 8 weeks after requested_at when complete_at is not set", () => {
  // 17.08.26 -> 12.10.26 (both summer time)
  expect(getSpgpaDeadline("2026-08-17T10:00:00Z", undefined)).toBe(
    "2026-10-12T10:00:00.000Z",
  );
});

it("is 3 months after complete_at when complete_at is set", () => {
  // requested 17.08.26, complete 20.10.26 -> 20.01.27
  // (summer to winter time: still 12:00 local, so 11:00Z)
  expect(getSpgpaDeadline("2026-08-17T10:00:00Z", "2026-10-20T10:00:00Z")).toBe(
    "2027-01-20T11:00:00.000Z",
  );
});

it("is 3 months after complete_at when only complete_at is set", () => {
  expect(getSpgpaDeadline(undefined, "2026-10-20T10:00:00Z")).toBe(
    "2027-01-20T11:00:00.000Z",
  );
});

it("has no deadline when neither is set", () => {
  expect(getSpgpaDeadline(undefined, undefined)).toBeUndefined();
  expect(getSpgpaDeadline(null, null)).toBeUndefined();
});

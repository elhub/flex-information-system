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

it("falls back to created_at when requested_at is not set", () => {
  // created 01.09.26 13:27 local, no requested_at (legacy data) -> 27.10.26
  // (summer to winter time: still 13:27 local, so 12:27Z)
  expect(getSpgpaDeadline(null, null, "2026-09-01T11:27:00Z")).toBe(
    "2026-10-27T12:27:00.000Z",
  );
});

it("prefers requested_at over created_at", () => {
  expect(
    getSpgpaDeadline("2026-08-17T10:00:00Z", null, "2026-08-01T10:00:00Z"),
  ).toBe("2026-10-12T10:00:00.000Z");
});

it("prefers complete_at over created_at", () => {
  expect(
    getSpgpaDeadline(null, "2026-10-20T10:00:00Z", "2026-08-01T10:00:00Z"),
  ).toBe("2027-01-20T11:00:00.000Z");
});

it("ignores a complete_at from before the latest request", () => {
  // complete 20.10.26, rejected, requested again 01.12.26 -> 26.01.27
  expect(getSpgpaDeadline("2026-12-01T11:00:00Z", "2026-10-20T10:00:00Z")).toBe(
    "2027-01-26T11:00:00.000Z",
  );
});

it("has no deadline when neither is set", () => {
  expect(getSpgpaDeadline(undefined, undefined)).toBeUndefined();
  expect(getSpgpaDeadline(null, null)).toBeUndefined();
});

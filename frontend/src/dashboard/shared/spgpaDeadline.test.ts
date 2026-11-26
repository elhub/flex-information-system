import { expect, it } from "vitest";
import { getSpgpaDeadline } from "./spgpaDeadline";

// dates chosen within the same DST period, so the result is timezone-stable

it("is 8 weeks after requested_at when only requested_at is set", () => {
  expect(getSpgpaDeadline("2026-05-01T12:00:00Z", undefined)).toBe(
    "2026-06-26T12:00:00.000Z",
  );
});

it("is 3 months after complete_at when only complete_at is set", () => {
  expect(getSpgpaDeadline(undefined, "2026-04-15T12:00:00Z")).toBe(
    "2026-07-15T12:00:00.000Z",
  );
});

it("uses requested_at when both are set", () => {
  expect(getSpgpaDeadline("2026-05-01T12:00:00Z", "2026-04-15T12:00:00Z")).toBe(
    "2026-06-26T12:00:00.000Z",
  );
});

it("has no deadline when neither is set", () => {
  expect(getSpgpaDeadline(undefined, undefined)).toBeUndefined();
  expect(getSpgpaDeadline(null, null)).toBeUndefined();
});

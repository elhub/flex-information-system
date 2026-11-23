import { beforeEach, describe, expect, it } from "vitest";
import { bellStorageKey, getLastChecked, setLastChecked } from "./lastChecked";

describe("lastChecked", () => {
  beforeEach(() => localStorage.clear());

  it("builds a stable key that does not reveal the user", async () => {
    const key = await bellStorageKey("user-sub-123", 42);
    expect(key).toBe(await bellStorageKey("user-sub-123", 42));
    expect(key).not.toContain("user-sub-123");
    expect(key).not.toBe(await bellStorageKey("user-sub-123", 43));
    expect(key).not.toBe(await bellStorageKey("other", 42));
  });

  it("returns null when never checked", () => {
    expect(getLastChecked("k")).toBeNull();
  });

  it("stores and reads the timestamp", () => {
    const d = new Date("2025-01-01T10:00:00Z");
    setLastChecked("k", d);
    expect(getLastChecked("k")).toBe(d.toISOString());
  });
});

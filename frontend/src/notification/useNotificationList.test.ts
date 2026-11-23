import { describe, expect, it } from "vitest";
import {
  EVENT_CATEGORY_FILTER_SOURCE,
  eventMatchesCategories,
  eventTypeIdsForCategories,
  toQueryFilters,
} from "./useNotificationList";

describe("notification list", () => {
  it("leaves filters without a category untouched", () => {
    expect(toQueryFilters({ acknowledged: "false" })).toEqual({
      acknowledged: "false",
    });
  });

  it("removes the category from the notification query filters", () => {
    const result = toQueryFilters({
      acknowledged: "false",
      [EVENT_CATEGORY_FILTER_SOURCE]: "comment",
    });
    expect(result).toEqual({ acknowledged: "false" });
  });

  it("matches events on the types of the selected categories", () => {
    const [commentType] = eventTypeIdsForCategories(["comment"]);
    expect(eventMatchesCategories({ type: commentType }, ["comment"])).toBe(
      true,
    );
    expect(eventMatchesCategories({ type: "no.such.type" }, ["comment"])).toBe(
      false,
    );
    expect(eventMatchesCategories(null, ["comment"])).toBe(false);
  });
});

import { describe, expect, it } from "vitest";
import {
  EVENT_CATEGORIES,
  EVENT_CATEGORY_FILTER_SOURCE,
  toQueryFilters,
} from "./useNotificationList";

describe("notification list", () => {
  it("leaves filters without a category untouched", () => {
    expect(toQueryFilters({ acknowledged: "false" })).toEqual({
      acknowledged: "false",
    });
  });

  it("expands the comment category to its event types", () => {
    const result = toQueryFilters({
      acknowledged: "false",
      [EVENT_CATEGORY_FILTER_SOURCE]: "comment",
    });
    expect(result).toEqual({
      acknowledged: "false",
      "event.type@in": EVENT_CATEGORIES.comment.join(","),
    });
  });
});

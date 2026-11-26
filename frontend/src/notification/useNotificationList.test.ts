import { describe, expect, it } from "vitest";
import {
  EVENT_CATEGORY_FILTER_SOURCE,
  categoryQuery,
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

  it("inner-joins and filters the event on the category types", () => {
    const { embed, filter } = categoryQuery({
      [EVENT_CATEGORY_FILTER_SOURCE]: "comment",
    });
    expect(embed).toBe("event!");
    expect(filter["event.type"]).toBe(
      `in.(${eventTypeIdsForCategories(["comment"]).join(",")})`,
    );
  });

  it("embeds the event without a filter when no category is selected", () => {
    expect(categoryQuery({})).toEqual({ embed: "event", filter: {} });
  });
});

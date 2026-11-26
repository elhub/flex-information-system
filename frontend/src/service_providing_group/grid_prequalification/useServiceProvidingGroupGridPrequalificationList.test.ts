import { describe, expect, it } from "vitest";
import {
  buildEmbed,
  SPG_NAME_FILTER_SOURCE,
} from "./useServiceProvidingGroupGridPrequalificationList";

describe("grid prequalification list", () => {
  it("left-joins the service providing group by default", () => {
    expect(buildEmbed({})).toBe(
      "service_providing_group,impacted_system_operator",
    );
  });

  it("inner-joins the service providing group when filtering on its name", () => {
    expect(buildEmbed({ [SPG_NAME_FILTER_SOURCE]: "abc" })).toBe(
      "service_providing_group!,impacted_system_operator",
    );
  });
});

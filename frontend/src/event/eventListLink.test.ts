import { describe, expect, it } from "vitest";
import { eventListLink } from "./eventListLink";

describe("eventListLink", () => {
  it("links to the event list filtered on the source", () => {
    const url = new URL(eventListLink("source", "/party/1"), "http://x");

    expect(url.pathname).toBe("/event");
    expect(url.searchParams.get("filtered")).toBe("1");
    expect(url.searchParams.get("f.source@eq")).toBe("/party/1");
  });

  it("links to the event list filtered on the subject", () => {
    const url = new URL(
      eventListLink("subject", "/party_membership/3"),
      "http://x",
    );

    expect(url.searchParams.get("f.subject@eq")).toBe("/party_membership/3");
  });
});

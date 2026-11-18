import { describe, expect, it } from "vitest";
import { getNotificationTarget } from "./eventTypes";

describe("getNotificationTarget", () => {
  it("links to the subject by default", () => {
    expect(
      getNotificationTarget({
        type: "no.elhub.flex.service_providing_group_product_application.create",
        source: "/service_providing_group/1",
        subject: "/service_providing_group_product_application/7",
      }),
    ).toEqual({
      resource: "service_providing_group_product_application",
      path: "/service_providing_group_product_application/7/show",
    });
  });

  it("links to the source for comment events", () => {
    expect(
      getNotificationTarget({
        type: "no.elhub.flex.service_providing_group_product_application_comment.create",
        source: "/service_providing_group_product_application/7",
        subject: "/service_providing_group_product_application_comment/3",
      }),
    ).toEqual({
      resource: "service_providing_group_product_application",
      path: "/service_providing_group_product_application/7/show?tab=comments",
    });
  });

  it("falls back to the source when there is no subject", () => {
    expect(
      getNotificationTarget({
        type: "no.elhub.flex.party.create",
        source: "/party/2",
      }),
    ).toEqual({ resource: "party", path: "/party/2/show" });
  });

  it("returns null when nothing can be parsed", () => {
    expect(getNotificationTarget({ type: "x", source: "/party" })).toBeNull();
    expect(getNotificationTarget(undefined)).toBeNull();
  });
});

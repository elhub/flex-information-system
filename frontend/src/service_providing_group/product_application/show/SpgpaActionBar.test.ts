import { describe, expect, it, vi } from "vitest";
import type { ServiceProvidingGroupProductApplication } from "../../../generated-client";
import { getActionsForStatus } from "./SpgpaActionBar";

vi.mock("../../../components/ui", () => ({}));
vi.mock("../../../components/ConfirmAction", () => ({}));

const translate = ((key: string) => key) as Parameters<
  typeof getActionsForStatus
>[1];

const spgpaWithStatus = (
  status: ServiceProvidingGroupProductApplication["status"],
) => ({ status }) as ServiceProvidingGroupProductApplication;

describe("getActionsForStatus", () => {
  it("offers a resend action to the SP on a rejected application", () => {
    const actions = getActionsForStatus(
      spgpaWithStatus("rejected"),
      translate,
      "flex_service_provider",
    );

    expect(actions).toHaveLength(1);
    expect(actions[0].label).toBe("text.spgpa_resend_label");
    expect(actions[0].payload).toEqual({ status: "requested" });
    expect(actions[0].requiresComment).toBeFalsy();
    expect(actions[0].requiresCompleteAt).toBe(false);
  });

  it.each([
    "requested",
    "prequalification",
    "temporary_qualified",
    "prequalified",
    "verified",
    "inactive",
  ] as const)("offers no action to the SP when status is %s", (status) => {
    expect(
      getActionsForStatus(
        spgpaWithStatus(status),
        translate,
        "flex_service_provider",
      ),
    ).toEqual([]);
  });

  it.each([
    "flex_system_operator",
    "flex_flexibility_information_system_operator",
  ] as const)("offers no action to %s on a rejected application", (role) => {
    expect(
      getActionsForStatus(spgpaWithStatus("rejected"), translate, role),
    ).toEqual([]);
  });

  it.each([
    "flex_system_operator",
    "flex_flexibility_information_system_operator",
  ] as const)("keeps the %s actions on a requested application", (role) => {
    const labels = getActionsForStatus(
      spgpaWithStatus("requested"),
      translate,
      role,
    ).map((action) => action.label);

    expect(labels).toEqual(["Start prequalification", "Reject"]);
  });

  it.each(["flex_energy_supplier", "flex_end_user", undefined] as const)(
    "offers no action to an unrelated role (%s)",
    (role) => {
      expect(
        getActionsForStatus(spgpaWithStatus("rejected"), translate, role),
      ).toEqual([]);
      expect(
        getActionsForStatus(spgpaWithStatus("requested"), translate, role),
      ).toEqual([]);
    },
  );
});

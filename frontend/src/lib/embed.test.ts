// frontend/src/lib/embed.test.ts
import { describe, expect, it } from "vitest";
import { embed } from "./embed";
import type {
  ControllableUnit,
  ServiceProvidingGroupMembership,
} from "../generated-client";

describe("embed", () => {
  it("returns empty string when no selections are made", () => {
    const result = embed<ControllableUnit>({});
    expect(result).toBe("");
  });

  it("embeds a single flat relation", () => {
    const result = embed<ControllableUnit>({ suspension: true });
    expect(result).toBe("suspension");
  });

  it("embeds multiple flat relations as comma-separated string", () => {
    const result = embed<ControllableUnit>({
      suspension: true,
      technical_resource: true,
    });
    expect(result).toBe("suspension,technical_resource");
  });

  it("embeds a nested relation", () => {
    const result = embed<ControllableUnit>({
      accounting_point: { bidding_zone: true },
    });
    expect(result).toBe("accounting_point(bidding_zone)");
  });

  it("embeds multiple nested relations", () => {
    const result = embed<ControllableUnit>({
      accounting_point: {
        bidding_zone: true,
        balance_responsible_party: true,
      },
    });
    expect(result).toBe(
      "accounting_point(bidding_zone,balance_responsible_party)",
    );
  });

  it("handles deeply nested embeds (real-world SPG membership case)", () => {
    const result = embed<ServiceProvidingGroupMembership>({
      controllable_unit: {
        accounting_point: {
          bidding_zone: true,
          balance_responsible_party: {
            balance_responsible_party: true,
          },
        },
      },
    });
    expect(result).toBe(
      "controllable_unit(accounting_point(bidding_zone," +
        "balance_responsible_party(balance_responsible_party)))",
    );
  });

  it("combines flat and nested relations", () => {
    const result = embed<ControllableUnit>({
      accounting_point: { bidding_zone: true },
      suspension: true,
    });
    expect(result).toBe("accounting_point(bidding_zone),suspension");
  });
});

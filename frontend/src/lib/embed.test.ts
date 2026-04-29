// frontend/src/lib/embed.test.ts
import { describe, expect, it } from "vitest";
import { embed } from "./embed";
import type {
  ControllableUnit,
  ServiceProvidingGroupMembership,
} from "../generated-client";

describe("embed", () => {
  it("returns empty string when no selections are made", () => {
    const result = embed<ControllableUnit>(() => {});
    expect(result).toBe("");
  });

  it("embeds a single flat relation", () => {
    const result = embed<ControllableUnit>((s) => {
      s.suspension();
    });
    expect(result).toBe("suspension");
  });

  it("embeds multiple flat relations as comma-separated string", () => {
    const result = embed<ControllableUnit>((s) => {
      s.suspension();
      s.technical_resource();
    });
    expect(result).toBe("suspension,technical_resource");
  });

  it("embeds a nested relation", () => {
    const result = embed<ControllableUnit>((s) => {
      s.accounting_point((a) => {
        a.bidding_zone();
      });
    });
    expect(result).toBe("accounting_point(bidding_zone)");
  });

  it("embeds multiple nested relations", () => {
    const result = embed<ControllableUnit>((s) => {
      s.accounting_point((a) => {
        a.bidding_zone();
        a.balance_responsible_party();
      });
    });
    expect(result).toBe(
      "accounting_point(bidding_zone,balance_responsible_party)",
    );
  });

  it("handles deeply nested embeds (real-world SPG membership case)", () => {
    const result = embed<ServiceProvidingGroupMembership>((s) => {
      s.controllable_unit((cu) => {
        cu.accounting_point((a) => {
          a.bidding_zone();
          a.balance_responsible_party((brp) => {
            brp.balance_responsible_party();
          });
        });
      });
    });
    expect(result).toBe(
      "controllable_unit(accounting_point(bidding_zone,balance_responsible_party(balance_responsible_party)))",
    );
  });

  it("combines flat and nested relations", () => {
    const result = embed<ControllableUnit>((s) => {
      s.accounting_point((a) => {
        a.bidding_zone();
      });
      s.suspension();
    });
    expect(result).toBe("accounting_point(bidding_zone),suspension");
  });
});

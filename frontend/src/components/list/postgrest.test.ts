import { describe, expect, it } from "vitest";
import { buildListQuery } from "./postgrest";

const base = {
  sort: { field: "id", order: "desc" as const },
  page: 1,
  perPage: 25,
};

describe("buildListQuery", () => {
  it("maps operators", () => {
    expect(
      buildListQuery({
        ...base,
        filters: {
          "name@ilike": "foo",
          "status@in": "active,new",
          "accounting_point.system_operator_id": "3",
        },
      }),
    ).toMatchObject({
      name: "ilike.*foo*",
      status: "in.(active,new)",
      "accounting_point.system_operator_id": "eq.3",
    });
  });

  it("ignores empty values", () => {
    expect(
      buildListQuery({ ...base, filters: { "name@ilike": "" } }),
    ).not.toHaveProperty("name");
  });

  it("maps sort and paging", () => {
    expect(
      buildListQuery({
        filters: {},
        sort: { field: "name", order: "asc" },
        page: 3,
        perPage: 50,
      }),
    ).toEqual({ order: "name.asc", limit: "50", offset: "100" });
  });
});

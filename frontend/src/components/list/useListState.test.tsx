import { act, renderHook } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import type { ReactNode } from "react";
import { describe, expect, it } from "vitest";
import { useListState } from "./useListState";

const defaultSort = { field: "id", order: "asc" } as const;

const renderListState = (
  url = "/",
  options: Parameters<typeof useListState>[0] = { defaultSort },
) => {
  const wrapper = ({ children }: { children: ReactNode }) => (
    <MemoryRouter initialEntries={[url]}>{children}</MemoryRouter>
  );
  return renderHook(() => useListState(options), { wrapper });
};

describe("useListState", () => {
  it("returns defaults when the URL is empty", () => {
    const { result } = renderListState("/", {
      defaultSort,
      defaultFilters: { status: "active" },
    });

    expect(result.current.filters).toEqual({ status: "active" });
    expect(result.current.sort).toEqual(defaultSort);
    expect(result.current.page).toBe(1);
    expect(result.current.perPage).toBe(25);
    expect(result.current.canResetFilters).toBe(false);
  });

  it("reads filters, sort and paging from the URL", () => {
    const { result } = renderListState(
      "/?filtered=1&f.name=abc&sort=name.desc&page=3&perPage=50",
    );

    expect(result.current.filters).toEqual({ name: "abc" });
    expect(result.current.sort).toEqual({ field: "name", order: "desc" });
    expect(result.current.page).toBe(3);
    expect(result.current.perPage).toBe(50);
  });

  it("falls back to defaults for invalid values", () => {
    const { result } = renderListState("/?sort=name.sideways&page=-1");

    expect(result.current.sort).toEqual(defaultSort);
    expect(result.current.page).toBe(1);
  });

  it("setFilter updates filters and resets the page", () => {
    const { result } = renderListState("/?page=3");

    act(() => result.current.setFilter("name", "abc"));

    expect(result.current.filters).toEqual({ name: "abc" });
    expect(result.current.page).toBe(1);
  });

  it("setFilter with no value removes the filter", () => {
    const { result } = renderListState("/?filtered=1&f.name=abc");

    act(() => result.current.setFilter("name", undefined));

    expect(result.current.filters).toEqual({});
  });

  it("clearFilters removes default filters", () => {
    const { result } = renderListState("/", {
      defaultSort,
      defaultFilters: { status: "active" },
    });

    act(() => result.current.clearFilters());

    expect(result.current.filters).toEqual({});
    expect(result.current.canResetFilters).toBe(true);
  });

  it("resetFilters restores default filters", () => {
    const { result } = renderListState("/?filtered=1&f.name=abc", {
      defaultSort,
      defaultFilters: { status: "active" },
    });

    act(() => result.current.resetFilters());

    expect(result.current.filters).toEqual({ status: "active" });
    expect(result.current.canResetFilters).toBe(false);
  });

  it("setSort updates the sort and resetSort restores the default", () => {
    const { result } = renderListState();

    act(() => result.current.setSort({ field: "name", order: "desc" }));
    expect(result.current.sort).toEqual({ field: "name", order: "desc" });

    act(() => result.current.resetSort());
    expect(result.current.sort).toEqual(defaultSort);
  });

  it("setPage and setPerPage update paging, and setPerPage resets the page", () => {
    const { result } = renderListState();

    act(() => result.current.setPage(4));
    expect(result.current.page).toBe(4);

    act(() => result.current.setPerPage(10));
    expect(result.current.perPage).toBe(10);
    expect(result.current.page).toBe(1);
  });
});

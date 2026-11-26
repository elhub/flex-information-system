import { beforeEach, describe, expect, it, vi } from "vitest";
import { listEvent } from "../generated-client";
import type { Event } from "../generated-client";
import { fetchEvents, fromLegacyFilterParam } from "./useEventList";

vi.mock("../generated-client", () => ({
  listEvent: vi.fn(),
}));

const mockedListEvent = vi.mocked(listEvent);

// Helper function for mock data
const eventFor = (id: number): Event =>
  ({
    id,
    type: "no.elhub.flex.party.create",
    source: `/party/${id}`,
    time: "2024-01-01T00:00:00Z",
  }) as unknown as Event;

const mockRows = (rows: Event[], total: number) =>
  mockedListEvent.mockResolvedValue({
    data: rows,
    error: undefined,
    response: new Response(null, {
      headers: { "Content-Range": `0-${rows.length - 1}/${total}` },
    }),
  } as Awaited<ReturnType<typeof listEvent>>);

describe("fetchEvents", () => {
  beforeEach(() => {
    mockedListEvent.mockReset();
  });

  it("requests an exact count and passes filters, sort and paging", async () => {
    mockRows([eventFor(2), eventFor(1)], 120);

    const result = await fetchEvents({
      filters: { "type@in": "a,b" },
      sort: { field: "time", order: "asc" },
      page: 3,
      perPage: 25,
    });

    expect(mockedListEvent).toHaveBeenCalledWith({
      query: {
        type: "in.(a,b)",
        order: "time.asc",
        limit: "25",
        offset: "50",
      },
      headers: { Prefer: "count=exact" },
    });
    expect(result.count).toBe(120);
    expect(result.data.map((e) => e.id)).toEqual([2, 1]);
  });
});

describe("fromLegacyFilterParam", () => {
  it("returns null without a legacy filter", () => {
    expect(fromLegacyFilterParam(new URLSearchParams("page=2"))).toBeNull();
  });

  it("translates a react-admin filter to list state params", () => {
    const params = new URLSearchParams({
      filter: JSON.stringify({ "source@eq": "/party/1" }),
      page: "2",
    });

    const next = fromLegacyFilterParam(params)!;

    expect(Object.fromEntries(next)).toEqual({
      "f.source@eq": "/party/1",
      filtered: "1",
    });
  });

  it("drops an invalid legacy filter", () => {
    const params = new URLSearchParams({ filter: "not json", sort: "id.asc" });

    expect(Object.fromEntries(fromLegacyFilterParam(params)!)).toEqual({
      sort: "id.asc",
    });
  });
});

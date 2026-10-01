import { beforeEach, expect, it, vi } from "vitest";
import {
  fetchSpgGridPrequalifications,
  SpgGridPrequalificationRow,
} from "./useSpgGridPrequalifications";
import type {
  Party,
  ServiceProvidingGroupGridPrequalification,
} from "../../generated-client";
import {
  listParty,
  listServiceProvidingGroupGridPrequalification,
} from "../../generated-client";

vi.mock("../../generated-client", () => ({
  listServiceProvidingGroupGridPrequalification: vi.fn(),
  listParty: vi.fn(),
}));

const mockedListPrequalifications = vi.mocked(
  listServiceProvidingGroupGridPrequalification,
);
const mockedListParty = vi.mocked(listParty);

// Helper function for mock data
const prequalificationFor = (
  id: number,
  impactedSystemOperatorId: number,
): ServiceProvidingGroupGridPrequalification =>
  ({
    id,
    service_providing_group_id: 1,
    impacted_system_operator_id: impactedSystemOperatorId,
    status: "approved",
    prequalified_at: "2024-01-01T00:00:00Z",
  }) as unknown as ServiceProvidingGroupGridPrequalification;

// Helper function for mock data
const partyFor = (id: number, name: string): Party =>
  ({ id, name }) as unknown as Party;

beforeEach(() => {
  mockedListPrequalifications.mockReset();
  mockedListParty.mockReset();
});

it("resolves the impacted system operator's name for each prequalification", async () => {
  mockedListPrequalifications.mockResolvedValue({
    data: [prequalificationFor(1, 10), prequalificationFor(2, 20)],
    error: undefined,
  } as Awaited<
    ReturnType<typeof listServiceProvidingGroupGridPrequalification>
  >);

  mockedListParty.mockResolvedValue({
    data: [
      partyFor(10, "Operator A"),
      partyFor(20, "Operator B"),
      partyFor(10, "Operator A"),
    ],
    error: undefined,
  } as Awaited<ReturnType<typeof listParty>>);

  const rows: SpgGridPrequalificationRow[] =
    await fetchSpgGridPrequalifications(1);

  expect(rows).toEqual([
    {
      id: 1,
      impactedSystemOperatorName: "Operator A",
      status: "approved",
      prequalifiedAt: "01.01.2024",
    },
    {
      id: 2,
      impactedSystemOperatorName: "Operator B",
      status: "approved",
      prequalifiedAt: "01.01.2024",
    },
  ]);

  expect(mockedListPrequalifications).toHaveBeenCalledWith({
    query: {
      service_providing_group_id: "eq.1",
      order: "id.desc",
    },
  });

  expect(mockedListParty).toHaveBeenCalledWith({
    query: { id: "in.(10,20)" },
  });
});

it("falls back to the raw ID when the party cannot be resolved", async () => {
  mockedListPrequalifications.mockResolvedValue({
    data: [prequalificationFor(1, 99)],
    error: undefined,
  } as Awaited<
    ReturnType<typeof listServiceProvidingGroupGridPrequalification>
  >);

  mockedListParty.mockResolvedValue({
    data: [],
    error: undefined,
  } as Awaited<ReturnType<typeof listParty>>);

  const rows = await fetchSpgGridPrequalifications(1);

  expect(rows[0].impactedSystemOperatorName).toBe("99");
});

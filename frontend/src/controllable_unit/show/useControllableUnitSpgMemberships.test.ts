import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  fetchSpgMembershipHistoryForControllableUnit,
  fetchSpgMembershipsForControllableUnit,
} from "./useControllableUnitSpgMemberships";
import type {
  ServiceProvidingGroupHistory,
  ServiceProvidingGroupMembership,
  ServiceProvidingGroupMembershipHistory,
} from "../../generated-client";
import {
  listServiceProvidingGroupMembership,
  listServiceProvidingGroupMembershipHistory,
} from "../../generated-client";

vi.mock("../../generated-client", () => ({
  listServiceProvidingGroupMembership: vi.fn(),
  listServiceProvidingGroupMembershipHistory: vi.fn(),
}));

const mockedListMemberships = vi.mocked(listServiceProvidingGroupMembership);
const mockedListMembershipHistory = vi.mocked(
  listServiceProvidingGroupMembershipHistory,
);

// Helper function for mock data
const membershipFor = (
  id: number,
  serviceProvidingGroupId: number,
): ServiceProvidingGroupMembership =>
  ({
    id,
    controllable_unit_id: 1,
    service_providing_group_id: serviceProvidingGroupId,
    valid_from: "2024-01-01",
  }) as unknown as ServiceProvidingGroupMembership;

// Helper function for mock data
const spgHistoryFor = (
  id: number,
  name: string,
): ServiceProvidingGroupHistory =>
  ({ id, name }) as unknown as ServiceProvidingGroupHistory;

// Helper function for mock data
const membershipHistoryFor = (
  id: number,
  serviceProvidingGroupHistory: ServiceProvidingGroupHistory[] | null,
): ServiceProvidingGroupMembershipHistory =>
  ({
    id,
    controllable_unit_id: 1,
    service_providing_group_id: 10,
    valid_from: "2024-01-01",
    recorded_at: "2024-01-01T00:00:00Z",
    service_providing_group_history: serviceProvidingGroupHistory,
  }) as unknown as ServiceProvidingGroupMembershipHistory;

beforeEach(() => {
  mockedListMemberships.mockReset();
  mockedListMembershipHistory.mockReset();
});

it("fetches memberships for a controllable unit with the service providing group embedded", async () => {
  mockedListMemberships.mockResolvedValue({
    data: [membershipFor(1, 10)],
    error: undefined,
  } as Awaited<ReturnType<typeof listServiceProvidingGroupMembership>>);

  const memberships = await fetchSpgMembershipsForControllableUnit(1);

  expect(memberships).toEqual([membershipFor(1, 10)]);
  expect(mockedListMemberships).toHaveBeenCalledWith({
    query: {
      controllable_unit_id: "eq.1",
      embed: "service_providing_group",
      order: "valid_from.desc",
    },
  });
});

describe("fetchSpgMembershipHistoryForControllableUnit", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2024-06-15T12:00:00Z"));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("returns an empty array when there is no history", async () => {
    mockedListMembershipHistory.mockResolvedValue({
      data: [],
      error: undefined,
    } as Awaited<
      ReturnType<typeof listServiceProvidingGroupMembershipHistory>
    >);

    const history = await fetchSpgMembershipHistoryForControllableUnit(1);

    expect(history).toEqual([]);
  });

  it("maps the current service providing group from the embedded history", async () => {
    mockedListMembershipHistory.mockResolvedValue({
      data: [membershipHistoryFor(1, [spgHistoryFor(10, "Group A")])],
      error: undefined,
    } as Awaited<
      ReturnType<typeof listServiceProvidingGroupMembershipHistory>
    >);

    const history = await fetchSpgMembershipHistoryForControllableUnit(1);

    expect(history).toEqual([
      {
        ...membershipHistoryFor(1, [spgHistoryFor(10, "Group A")]),
        service_providing_group: spgHistoryFor(10, "Group A"),
      },
    ]);

    expect(mockedListMembershipHistory).toHaveBeenCalledWith({
      query: {
        controllable_unit_id: "eq.1",
        order: "service_providing_group_id.asc,recorded_at.desc",
        embed: "service_providing_group_history!",
        "service_providing_group_history.as_of": "2024-06-15T12:00:00.000Z",
      },
    });
  });

  it("falls back to null when the service providing group history is empty", async () => {
    mockedListMembershipHistory.mockResolvedValue({
      data: [membershipHistoryFor(1, [])],
      error: undefined,
    } as Awaited<
      ReturnType<typeof listServiceProvidingGroupMembershipHistory>
    >);

    const history = await fetchSpgMembershipHistoryForControllableUnit(1);

    expect(history[0].service_providing_group).toBeNull();
  });
});

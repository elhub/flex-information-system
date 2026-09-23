import { afterEach, beforeEach, expect, it, vi } from "vitest";
import { fetchSpgChanges } from "./useSpgChangesViewModel";
import type { ServiceProvidingGroupMembershipHistory } from "../../../generated-client";
import { listServiceProvidingGroupMembershipHistory } from "../../../generated-client";

vi.mock("../../../generated-client", () => ({
  listServiceProvidingGroupMembershipHistory: vi.fn(),
}));

const mockedList = vi.mocked(listServiceProvidingGroupMembershipHistory);

const FROM = "2024-01-01T00:00:00.000Z";
const NOW = "2024-06-01T00:00:00.000Z";

// Helper function for mock data
const membershipFor = (
  cuId: number,
  name: string,
  maximumActivePower: number,
  { replacedAt, recordedAt }: { replacedAt?: string; recordedAt?: string } = {},
): ServiceProvidingGroupMembershipHistory =>
  ({
    id: cuId,
    controllable_unit_id: cuId,
    replaced_at: replacedAt,
    recorded_at: recordedAt,
    controllable_unit_history: [
      {
        name,
        maximum_active_power: maximumActivePower,
        replaced_at: replacedAt,
        recorded_at: recordedAt,
      },
    ],
  }) as unknown as ServiceProvidingGroupMembershipHistory;

// Helper function for mock data
const mockSnapshots = (
  old: ServiceProvidingGroupMembershipHistory[],
  current: ServiceProvidingGroupMembershipHistory[],
) => {
  mockedList.mockImplementation(async (options) => {
    const query = options?.query as Record<string, string> | undefined;
    const data = query?.as_of === FROM ? old : current;
    return { data, error: undefined };
  });
};

beforeEach(() => {
  mockedList.mockReset();
  vi.useFakeTimers();
  vi.setSystemTime(new Date(NOW));
});

afterEach(() => {
  vi.useRealTimers();
});

it("marks a controllable unit only present in the current snapshot as added", async () => {
  mockSnapshots([], [membershipFor(1, "CU 1", 50)]);

  const rows = await fetchSpgChanges(1, FROM, NOW);

  expect(rows).toEqual([expect.objectContaining({ id: 1, status: "added" })]);
});

it("marks a controllable unit only present in the old snapshot as removed", async () => {
  mockSnapshots([membershipFor(1, "CU 1", 50)], []);

  const rows = await fetchSpgChanges(1, FROM, NOW);

  expect(rows).toEqual([expect.objectContaining({ id: 1, status: "removed" })]);
});

it("marks a controllable unit as changed when its name or power differs", async () => {
  mockSnapshots(
    [membershipFor(1, "CU 1", 50)],
    [membershipFor(1, "CU 1 renamed", 50)],
  );

  const rows = await fetchSpgChanges(1, FROM, NOW);

  expect(rows[0].status).toBe("changed");
});

it("marks a controllable unit as unchanged when name and power are identical", async () => {
  mockSnapshots([membershipFor(1, "CU 1", 50)], [membershipFor(1, "CU 1", 50)]);

  const rows = await fetchSpgChanges(1, FROM, NOW);

  expect(rows[0].status).toBe("unchanged");
});

it("computes firstChange/lastChange as the min/max of the relevant dates", async () => {
  mockSnapshots(
    [
      membershipFor(1, "CU 1", 50, {
        replacedAt: "2024-02-01T00:00:00.000Z",
      }),
    ],
    [
      membershipFor(1, "CU 1 renamed", 50, {
        recordedAt: "2024-03-01T00:00:00.000Z",
      }),
    ],
  );

  const rows = await fetchSpgChanges(1, FROM, NOW);

  expect(rows[0].firstChange).toBe("2024-02-01T00:00:00.000Z");
  expect(rows[0].lastChange).toBe("2024-03-01T00:00:00.000Z");
});

it("sorts rows by name, preferring the new name over the old name", async () => {
  mockSnapshots(
    [membershipFor(2, "Charlie", 50)],
    [membershipFor(1, "Alpha", 50), membershipFor(3, "Bravo", 50)],
  );

  const rows = await fetchSpgChanges(1, FROM, NOW);

  expect(rows.map((r) => r.id)).toEqual([1, 3, 2]);
});

it("ignores memberships with no controllable unit history embedded", async () => {
  const withoutHistory = {
    id: 1,
    controllable_unit_id: 1,
    controllable_unit_history: [],
  } as unknown as ServiceProvidingGroupMembershipHistory;

  mockSnapshots([withoutHistory], []);

  const rows = await fetchSpgChanges(1, FROM, NOW);

  expect(rows).toEqual([]);
});

it("returns an empty array when neither snapshot has any memberships", async () => {
  mockSnapshots([], []);

  const rows = await fetchSpgChanges(1, FROM, NOW);

  expect(rows).toEqual([]);
});

it("fetches the old snapshot as of the given date and the current snapshot as of now", async () => {
  mockSnapshots([], []);

  await fetchSpgChanges(42, FROM, NOW);

  expect(mockedList).toHaveBeenCalledTimes(2);
  expect(mockedList).toHaveBeenCalledWith({
    query: expect.objectContaining({
      service_providing_group_id: "eq.42",
      as_of: FROM,
      valid_at: FROM,
    }),
  });
  expect(mockedList).toHaveBeenCalledWith({
    query: expect.objectContaining({
      service_providing_group_id: "eq.42",
      as_of: NOW,
      valid_at: NOW,
    }),
  });
});

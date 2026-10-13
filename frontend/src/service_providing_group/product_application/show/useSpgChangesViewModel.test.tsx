import { beforeEach, expect, it, vi } from "vitest";
import { waitFor } from "@testing-library/react";
import {
  changedCuProperties,
  fetchSpgChanges,
  membershipValidityChanged,
  useControllableUnitHistory,
} from "./useSpgChangesViewModel";
import type {
  ControllableUnitHistory,
  Identity,
  ServiceProvidingGroupMembershipHistory,
} from "../../../generated-client";
import {
  listControllableUnitHistory,
  listIdentity,
  listServiceProvidingGroupMembershipHistory,
} from "../../../generated-client";
import { renderHookWithQuery } from "../../../test/test-utils";

vi.mock("../../../generated-client", () => ({
  listServiceProvidingGroupMembershipHistory: vi.fn(),
  listControllableUnitHistory: vi.fn(),
  listIdentity: vi.fn(),
}));

const mockedSpgHistoryList = vi.mocked(
  listServiceProvidingGroupMembershipHistory,
);

const mockedListCuHistory = vi.mocked(listControllableUnitHistory);
const mockedListIdentities = vi.mocked(listIdentity);

const FROM = "2024-01-01T00:00:00.000Z";
const NOW = "2024-06-01T00:00:00.000Z";

// Helper function for mock data
const membershipFor = (
  cuId: number,
  name: string,
  maximumActivePower: number,
  {
    replacedAt,
    recordedAt,
    validFrom,
    validTo,
  }: {
    replacedAt?: string;
    recordedAt?: string;
    validFrom?: string;
    validTo?: string;
  } = {},
): ServiceProvidingGroupMembershipHistory =>
  ({
    id: cuId,
    controllable_unit_id: cuId,
    replaced_at: replacedAt,
    recorded_at: recordedAt,
    valid_from: validFrom,
    valid_to: validTo,
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
  mockedSpgHistoryList.mockImplementation(async (options) => {
    const query = options?.query as Record<string, string> | undefined;
    const data = query?.as_of === FROM ? old : current;
    return { data, error: undefined };
  });
};

const mockCuHistory = (data: ControllableUnitHistory[]) => {
  mockedListCuHistory.mockImplementation(async () => {
    return { data, error: null } as never;
  });
};

const mockIdentities = (data: Identity[]) => {
  mockedListIdentities.mockImplementation(async () => {
    return { data, error: null } as never;
  });
};

beforeEach(() => {
  mockedSpgHistoryList.mockReset();
  mockedListCuHistory.mockReset();
  mockedListIdentities.mockReset();
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

it("marks a controllable unit as changed when only valid_from differs", async () => {
  mockSnapshots(
    [membershipFor(1, "CU 1", 50, { validFrom: "2024-01-01T00:00:00Z" })],
    [membershipFor(1, "CU 1", 50, { validFrom: "2024-02-01T00:00:00Z" })],
  );

  const rows = await fetchSpgChanges(1, FROM, NOW);

  expect(rows[0].status).toBe("changed");
});

it("marks a controllable unit as changed when only valid_to differs", async () => {
  mockSnapshots(
    [membershipFor(1, "CU 1", 50, { validFrom: "2024-01-01T00:00:00Z" })],
    [
      membershipFor(1, "CU 1", 50, {
        validFrom: "2024-01-01T00:00:00Z",
        validTo: "2024-12-01T00:00:00Z",
      }),
    ],
  );

  const rows = await fetchSpgChanges(1, FROM, NOW);

  expect(rows[0].status).toBe("changed");
});

it("treats null and undefined valid_to as equal", () => {
  const a = membershipFor(1, "CU 1", 50, { validFrom: "2024-01-01T00:00:00Z" });
  const b = {
    ...membershipFor(1, "CU 1", 50, { validFrom: "2024-01-01T00:00:00Z" }),
    valid_to: null,
  } as unknown as ServiceProvidingGroupMembershipHistory;

  expect(membershipValidityChanged(a, b)).toBe(false);
});

it("changedCuProperties returns the differing keys, and none if a CU is missing", () => {
  const a = membershipFor(1, "CU 1", 50);
  const b = membershipFor(1, "CU 2", 60);

  expect(changedCuProperties(a, b)).toEqual(["name", "maximum_active_power"]);
  expect(changedCuProperties(a, undefined)).toEqual([]);
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

  expect(mockedSpgHistoryList).toHaveBeenCalledTimes(2);
  expect(mockedSpgHistoryList).toHaveBeenCalledWith({
    query: expect.objectContaining({
      service_providing_group_id: "eq.42",
      as_of: FROM,
      valid_at: FROM,
    }),
  });
  expect(mockedSpgHistoryList).toHaveBeenCalledWith({
    query: expect.objectContaining({
      service_providing_group_id: "eq.42",
      as_of: NOW,
      valid_at: NOW,
    }),
  });
});

it("fetches expected cu history enriched with party name for recorded_by_name and replaced_by_name", async () => {
  const expectedHistory = [
    {
      id: 1,
      controllable_unit_id: 1,
      accounting_point_id: 1001,
      business_id: "ecd8b068-c9f9-487e-9f44-13a6c29fee2d",
      maximum_active_power: 3.0,
      is_small: true,
      name: "Test Electric vehicle charger",
      regulation_direction: "up",
      start_date: "2020-01-01",
      status: "inactive",
      additional_information: null,
      recorded_by: 2,
      recorded_at: "2026-09-24T11:56:01.356224+00:00",
      replaced_by: null,
      replaced_at: null,
    },
    {
      id: 2,
      controllable_unit_id: 1,
      accounting_point_id: 1001,
      business_id: "ecd8b068-c9f9-487e-9f44-13a6c29fee2d",
      maximum_active_power: 3.5,
      is_small: true,
      name: "Test Electric vehicle charger",
      regulation_direction: "up",
      start_date: "2020-01-01",
      status: "active",
      additional_information: null,
      recorded_by: 3,
      recorded_at: "2026-09-24T11:56:01.356224+00:00",
      replaced_by: 3,
      replaced_at: "2026-09-25T13:56:01.356224+00:00",
    },
  ];
  mockCuHistory(expectedHistory as unknown as ControllableUnitHistory[]);

  const expectedIdentities = [
    {
      id: 2,
      entity_id: 3,
      entity_name: "Test Suite",
      party_id: 17,
      party_name: "Test SP",
    },
    {
      id: 3,
      entity_id: 4,
      entity_name: "Test Suite",
      party_id: 17,
      party_name: "Test FISO",
    },
  ];
  mockIdentities(expectedIdentities);

  const controllableUnitId = 1;

  const historyResult = renderHookWithQuery(() =>
    useControllableUnitHistory(controllableUnitId),
  );
  await waitFor(() => {
    expect(historyResult.result.current.data[1]?.replaced_by_name).toBe(
      "Test FISO",
    );
  });
  const history = historyResult.result.current.data;

  expect(listControllableUnitHistory).toHaveBeenCalledWith({
    query: expect.objectContaining({
      controllable_unit_id: "eq." + controllableUnitId,
    }),
  });

  expect(listIdentity).toHaveBeenCalledWith({
    query: expect.objectContaining({
      id: "in.(2,3)",
    }),
  });

  expect(history.length).toEqual(expectedHistory.length);
  expect(history[0].recorded_by_name).toEqual("Test SP");
  expect(history[0].replaced_by_name).toBeUndefined();
  expect(history[1].recorded_by_name).toEqual("Test FISO");
  expect(history[1].replaced_by_name).toEqual("Test FISO");
});

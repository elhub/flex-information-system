import { beforeEach, expect, it, vi } from "vitest";
import { renderHook, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import type { ReactNode } from "react";
import { useState } from "react";
import { useSpgpaControllableUnits } from "./useSpgpaControllableUnits";
import {
  listAccountingPoint,
  listServiceProvidingGroupGridPrequalification,
} from "../../../generated-client";
import { fetchSnapshot } from "./useSpgChangesViewModel";

vi.mock("../../../generated-client", () => ({
  listServiceProvidingGroupGridPrequalification: vi.fn(),
  listAccountingPoint: vi.fn(),
}));

vi.mock("./useSpgChangesViewModel", () => ({
  fetchSnapshot: vi.fn(),
}));

const mockedListGridPrequalifications = vi.mocked(
  listServiceProvidingGroupGridPrequalification,
);
const mockedListAccountingPoint = vi.mocked(listAccountingPoint);
const mockedFetchSnapshot = vi.mocked(fetchSnapshot);

function QueryClientWrapper({ children }: { children: ReactNode }) {
  const [queryClient] = useState(
    () => new QueryClient({ defaultOptions: { queries: { retry: false } } }),
  );

  return (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
}

const membershipFor = (id: number, recordedAt: string, name = `CU ${id}`) =>
  [
    id,
    {
      controllable_unit_id: id,
      valid_from: "2024-01-01",
      valid_to: "2024-12-31",
      recorded_at: recordedAt,
      controllable_unit_history: [
        {
          name,
          maximum_active_power: 100,
          regulation_direction: "up",
          status: "active",
          accounting_point_id: 100 + id,
        },
      ],
    },
  ] as const;

const gridPrequalificationFor = (
  impactedSystemOperatorId: number,
  prequalifiedAt: string,
) =>
  ({
    id: impactedSystemOperatorId,
    service_providing_group_id: 1,
    impacted_system_operator_id: impactedSystemOperatorId,
    status: "approved",
    prequalified_at: prequalifiedAt,
  }) as any;

beforeEach(() => {
  mockedListGridPrequalifications.mockReset();
  mockedListAccountingPoint.mockReset();
  mockedFetchSnapshot.mockReset();

  mockedFetchSnapshot.mockResolvedValue(
    new Map([
      membershipFor(1, "2024-01-01T00:00:00Z") as any,
      membershipFor(2, "2024-01-03T00:00:00Z") as any,
    ]),
  );

  mockedListAccountingPoint.mockResolvedValue({
    data: [
      { id: 101, business_id: "AP-1", system_operator_id: 1 },
      { id: 102, business_id: "AP-2", system_operator_id: 2 },
    ],
    error: undefined,
  } as any);

  mockedListGridPrequalifications.mockResolvedValue({
    data: [
      gridPrequalificationFor(1, "2024-01-02T00:00:00Z"),
      gridPrequalificationFor(2, "2024-01-04T00:00:00Z"),
    ],
    error: undefined,
  } as Awaited<
    ReturnType<typeof listServiceProvidingGroupGridPrequalification>
  >);
});

it("sorts controllable units by membershipRecordedAt descending", async () => {
  const { result } = renderHook(
    () => useSpgpaControllableUnits(1, undefined, "2024-02-01T00:00:00.000Z"),
    { wrapper: QueryClientWrapper },
  );

  await waitFor(() =>
    expect(result.current.data?.rows.map((row) => row.name)).toEqual([
      "CU 2",
      "CU 1",
    ]),
  );

  expect(mockedFetchSnapshot).toHaveBeenCalledWith(
    1,
    "2024-02-01T00:00:00.000Z",
  );
  expect(mockedListGridPrequalifications).toHaveBeenCalledWith({
    query: {
      service_providing_group_id: "eq.1",
    },
  });
});

it("refetches members for a new date without refetching prequalifications", async () => {
  const { result, rerender } = renderHook(
    ({ asOf }) => useSpgpaControllableUnits(1, undefined, asOf),
    {
      wrapper: QueryClientWrapper,
      initialProps: { asOf: "2024-02-01T00:00:00.000Z" },
    },
  );
  await waitFor(() => expect(result.current.data?.rows).toHaveLength(2));

  mockedFetchSnapshot.mockResolvedValue(
    new Map([membershipFor(1, "2024-01-01T00:00:00Z", "Old name") as any]),
  );
  rerender({ asOf: "2024-01-02T00:00:00.000Z" });

  await waitFor(() =>
    expect(result.current.data?.rows.map((row) => row.name)).toEqual([
      "Old name",
    ]),
  );
  expect(mockedFetchSnapshot).toHaveBeenLastCalledWith(
    1,
    "2024-01-02T00:00:00.000Z",
  );
  expect(mockedListGridPrequalifications).toHaveBeenCalledTimes(1);
  expect(result.current.isLoading).toBe(false);
});

const approvalsAsOf = async (asOf: string) => {
  const spgpa = {
    status: "verified",
    prequalified_at: "2024-01-02T00:00:00Z",
    verified_at: "2024-01-05T00:00:00Z",
  } as any;
  const { result } = renderHook(
    () => useSpgpaControllableUnits(1, spgpa, asOf),
    { wrapper: QueryClientWrapper },
  );
  await waitFor(() => expect(result.current.data?.rows).toHaveLength(2));
  const byName = (name: string) =>
    result.current.data?.rows.find((row) => row.name === name);
  return { unit1: byName("CU 1"), unit2: byName("CU 2") };
};

it("shows no approvals before they were given", async () => {
  const { unit1 } = await approvalsAsOf("2024-01-01T12:00:00.000Z");

  expect(unit1?.gridPrequalifiedAt).toBeUndefined();
  expect(unit1?.productApplicationPrequalifiedAt).toBeUndefined();
});

it("shows the approvals that had been given at the selected date", async () => {
  const { unit1, unit2 } = await approvalsAsOf("2024-01-03T12:00:00.000Z");

  expect(unit1?.gridPrequalifiedAt).toBe("2024-01-02T00:00:00Z");
  expect(unit1?.productApplicationPrequalifiedAt).toBe("2024-01-02T00:00:00Z");
  // Grid prequalification for unit 2's system operator comes later (01-04).
  expect(unit2?.gridPrequalifiedAt).toBeUndefined();
  // Unit 2 joined (01-03) after the application was prequalified (01-02).
  expect(unit2?.productApplicationPrequalifiedAt).toBeUndefined();
});

it("uses the verification once it has happened", async () => {
  const { unit1 } = await approvalsAsOf("2024-02-01T00:00:00.000Z");

  expect(unit1?.productApplicationPrequalifiedAt).toBe("2024-01-05T00:00:00Z");
});

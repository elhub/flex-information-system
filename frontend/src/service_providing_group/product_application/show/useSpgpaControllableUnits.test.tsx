import { beforeEach, expect, it, vi } from "vitest";
import { renderHook, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import type { ReactNode } from "react";
import { useState } from "react";
import { useSpgpaControllableUnits } from "./useSpgpaControllableUnits";
import { listServiceProvidingGroupGridPrequalification } from "../../../generated-client";
import { useSpgMemberControllableUnits } from "../../shared/useSpgMemberControllableUnits";

vi.mock("../../../generated-client", () => ({
  listServiceProvidingGroupGridPrequalification: vi.fn(),
}));

vi.mock("../../shared/useSpgMemberControllableUnits", () => ({
  useSpgMemberControllableUnits: vi.fn(),
}));

const mockedListGridPrequalifications = vi.mocked(
  listServiceProvidingGroupGridPrequalification,
);
const mockedUseSpgMemberControllableUnits = vi.mocked(
  useSpgMemberControllableUnits,
);

function QueryClientWrapper({ children }: { children: ReactNode }) {
  const [queryClient] = useState(
    () => new QueryClient({ defaultOptions: { queries: { retry: false } } }),
  );

  return (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
}

const rowFor = (id: number, membershipRecordedAt: string) =>
  ({
    id,
    membershipId: id,
    name: `CU ${id}`,
    validFrom: "2024-01-01",
    validTo: "2024-12-31",
    maximum_active_power: 100,
    rated_power: 100,
    location: `AP-${id}`,
    regulation_direction: "up",
    mpid: `AP-${id}`,
    accountingPointId: 100 + id,
    brpName: "BRP",
    status: "active",
    accountingPointSystemOperatorId: id,
    membershipRecordedAt,
  }) as any;

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
  mockedUseSpgMemberControllableUnits.mockReset();

  mockedUseSpgMemberControllableUnits.mockReturnValue({
    data: {
      rows: [
        rowFor(1, "2024-01-01T00:00:00Z"),
        rowFor(2, "2024-01-03T00:00:00Z"),
      ],
    },
    isLoading: false,
    error: null,
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
  const { result } = renderHook(() => useSpgpaControllableUnits(1, undefined), {
    wrapper: QueryClientWrapper,
  });

  await waitFor(() =>
    expect(result.current.data?.rows.map((row) => row.name)).toEqual([
      "CU 2",
      "CU 1",
    ]),
  );

  expect(mockedListGridPrequalifications).toHaveBeenCalledWith({
    query: {
      service_providing_group_id: "eq.1",
    },
  });
});

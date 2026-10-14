import { beforeEach, expect, it, vi } from "vitest";
import { renderHook, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import type { ReactNode } from "react";
import { useState } from "react";
import { useSpgControllableUnitsMap } from "./useSpgControllableUnits";
import type { ServiceProvidingGroupMembership } from "../../generated-client";
import { listServiceProvidingGroupMembership } from "../../generated-client";

vi.mock("../../generated-client", () => ({
  listServiceProvidingGroupMembership: vi.fn(),
}));

const mockedList = vi.mocked(listServiceProvidingGroupMembership);

const EXPECTED_EMBED =
  "controllable_unit!(summary,accounting_point!(grid_location!,balance_responsible_party(balance_responsible_party)))";

// Mock data
const membershipAt = (
  substationId: string,
  cuId: number,
  cuName: string,
): ServiceProvidingGroupMembership =>
  ({
    id: cuId,
    valid_from: "2024-01-01",
    controllable_unit: {
      id: cuId,
      name: cuName,
      maximum_active_power: 50,
      regulation_direction: "up",
      accounting_point_id: 100 + cuId,
      summary: { technical_resource: { maximum_active_power: { sum: 60 } } },
      accounting_point: {
        id: 100 + cuId,
        business_id: `AP-${cuId}`,
        grid_location: { business_id: substationId },
        balance_responsible_party: [],
      },
    },
  }) as unknown as ServiceProvidingGroupMembership;

function QueryClientWrapper({ children }: { children: ReactNode }) {
  const [queryClient] = useState(
    () => new QueryClient({ defaultOptions: { queries: { retry: false } } }),
  );
  return (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
}

const expectCorrectCallForSubstation = (
  callIndex: number,
  substationId: string,
) => {
  const [options] = mockedList.mock.calls[callIndex];
  const query = options?.query as Record<string, string> | undefined;

  expect(query?.embed).toBe(EXPECTED_EMBED);
  expect(
    query?.["controllable_unit.accounting_point.grid_location.business_id"],
  ).toBe(`eq.${substationId}`);
  expect(query?.service_providing_group_id).toBe("eq.1");
  expect(query?.valid_at).toEqual(expect.any(String));
};

beforeEach(() => {
  mockedList.mockReset();
});

it(
  "builds a correct map as more substations with CUs load," +
    " without losing or mixing up earlier data",
  async () => {
    mockedList.mockImplementation(async (options) => {
      const query = options?.query as Record<string, string> | undefined;
      const filter =
        query?.["controllable_unit.accounting_point.grid_location.business_id"];
      const substationId = filter?.replace("eq.", "");

      const data =
        substationId === "SUB-1"
          ? [membershipAt("SUB-1", 1, "CU 1")]
          : substationId === "SUB-2"
            ? [membershipAt("SUB-2", 2, "CU 2")]
            : [];

      return { data, error: undefined };
    });

    const { result, rerender } = renderHook(
      ({ ids }: { ids: string[] }) => useSpgControllableUnitsMap(1, ids),
      { wrapper: QueryClientWrapper, initialProps: { ids: ["SUB-1"] } },
    );

    await waitFor(() => expect(result.current.get("SUB-1")).toHaveLength(1));
    expect(result.current.get("SUB-1")?.[0].name).toBe("CU 1");
    expect(result.current.get("SUB-2")).toBeUndefined();

    expect(mockedList).toHaveBeenCalledTimes(1);
    expectCorrectCallForSubstation(0, "SUB-1");

    rerender({ ids: ["SUB-1", "SUB-2"] });

    await waitFor(() => expect(result.current.get("SUB-2")).toHaveLength(1));

    expect(result.current.get("SUB-1")?.[0].name).toBe("CU 1");
    expect(result.current.get("SUB-2")?.[0].name).toBe("CU 2");

    expect(mockedList).toHaveBeenCalledTimes(2);
    expectCorrectCallForSubstation(1, "SUB-2");
  },
);

import { beforeEach, expect, it, vi } from "vitest";
import { fetchSpgpqSubstationApprovedPower } from "./useSpgpqSubstationApprovedPower";
import { listServiceProvidingGroupGridPrequalificationSubstationApprovedPower } from "../../../generated-client";

vi.mock("../../../generated-client", () => ({
  listServiceProvidingGroupGridPrequalificationSubstationApprovedPower: vi.fn(),
}));

const mockedList = vi.mocked(
  listServiceProvidingGroupGridPrequalificationSubstationApprovedPower,
);

beforeEach(() => {
  mockedList.mockReset();
});

it("filters on the grid prequalification and maps rows", async () => {
  mockedList.mockResolvedValue({
    data: [
      {
        service_providing_group_grid_prequalification_id: 1,
        substation_business_id: "SUB-1",
        substation_name: "Substation One",
        controllable_unit_count: 2,
        maximum_active_power: 7,
        total_approved_maximum_active_power: 17.5,
      },
    ],
    error: undefined,
  } as unknown as Awaited<ReturnType<typeof mockedList>>);

  const rows = await fetchSpgpqSubstationApprovedPower(1);

  expect(mockedList).toHaveBeenCalledWith({
    query: {
      service_providing_group_grid_prequalification_id: "eq.1",
      order: "substation_name.asc",
    },
  });
  expect(rows).toEqual([
    {
      id: "SUB-1",
      substationBusinessId: "SUB-1",
      substationName: "Substation One",
      controllableUnitCount: 2,
      maximumActivePowerSum: 7,
      totalApprovedMaximumActivePowerSum: 17.5,
    },
  ]);
});

it("returns no rows for an empty list", async () => {
  mockedList.mockResolvedValue({
    data: [],
    error: undefined,
  } as unknown as Awaited<ReturnType<typeof mockedList>>);
  expect(await fetchSpgpqSubstationApprovedPower(1)).toEqual([]);
});

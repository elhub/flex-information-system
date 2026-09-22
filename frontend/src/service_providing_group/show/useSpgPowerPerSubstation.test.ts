import { beforeEach, expect, it, vi } from "vitest";
import { fetchSpgPowerPerSubstation } from "./useSpgPowerPerSubstation";
import type { ServiceProvidingGroupPowerPerSubstation } from "../../generated-client";
import { readServiceProvidingGroupPowerPerSubstation } from "../../generated-client";

vi.mock("../../generated-client", () => ({
  readServiceProvidingGroupPowerPerSubstation: vi.fn(),
}));

const mockedReadPowerPerSubstation = vi.mocked(
  readServiceProvidingGroupPowerPerSubstation,
);

// Helper function for mock data
const powerPerSubstationFor = (
  substations: ServiceProvidingGroupPowerPerSubstation["substations"],
): ServiceProvidingGroupPowerPerSubstation =>
  ({
    id: 1,
    service_providing_group_id: 1,
    substations,
  }) as unknown as ServiceProvidingGroupPowerPerSubstation;

beforeEach(() => {
  mockedReadPowerPerSubstation.mockReset();
});

it("maps substation aggregates to rows", async () => {
  mockedReadPowerPerSubstation.mockResolvedValue({
    data: powerPerSubstationFor([
      {
        substation_business_id: "SUB-1",
        substation_name: "Substation One",
        controllable_unit: {
          count: 3,
          maximum_active_power: { sum: 30, average: 10, min: 5, max: 15 },
        },
        technical_resource: {
          count: 4,
          maximum_active_power: { sum: 40, average: 10, min: 5, max: 20 },
        },
      },
    ]),
    error: undefined,
  } as Awaited<ReturnType<typeof readServiceProvidingGroupPowerPerSubstation>>);

  const rows = await fetchSpgPowerPerSubstation(1);

  expect(rows).toEqual([
    {
      id: "SUB-1",
      substationBusinessId: "SUB-1",
      substationName: "Substation One",
      controllableUnitCount: 3,
      maximumActivePowerSum: 30,
      ratedPowerSum: 40,
      ratedPowerMin: 5,
      ratedPowerMax: 20,
    },
  ]);

  expect(mockedReadPowerPerSubstation).toHaveBeenCalledWith({
    path: { id: 1 },
  });
});

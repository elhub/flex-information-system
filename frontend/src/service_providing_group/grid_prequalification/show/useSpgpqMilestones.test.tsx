import { beforeEach, expect, it, vi } from "vitest";
import { waitFor } from "@testing-library/react";
import { useSpgpqMilestones } from "./useSpgpqMilestones";
import {
  listServiceProvidingGroupGridPrequalificationHistory,
  ServiceProvidingGroupGridPrequalification,
} from "../../../generated-client";
import { renderHookWithQuery } from "../../../test/test-utils";

vi.mock("../../../generated-client", () => ({
  listServiceProvidingGroupGridPrequalificationHistory: vi.fn(),
}));

const mockedHistory = vi.mocked(
  listServiceProvidingGroupGridPrequalificationHistory,
);

const CREATED = "2024-01-01T00:00:00.000Z";
const APPROVED = "2024-02-01T00:00:00.000Z";
const LATER_UPDATE = "2024-03-01T00:00:00.000Z";
const NOW = "2024-06-01T00:00:00.000Z";

// updated after the approval, so recorded_at is not the creation time
const spgpq = {
  id: 7,
  recorded_at: LATER_UPDATE,
  prequalified_at: APPROVED,
} as ServiceProvidingGroupGridPrequalification;

const times = (milestones: { at: string | undefined }[]) =>
  milestones.map((milestone) => milestone.at);

beforeEach(() => {
  mockedHistory.mockReset();
});

it("leaves out the creation time until the history is loaded", async () => {
  mockedHistory.mockReturnValue(new Promise(() => {}) as never);

  const { result } = renderHookWithQuery(() => useSpgpqMilestones(spgpq, NOW));

  // not the recorded time of the latest version
  expect(times(result.current)).toEqual([undefined, APPROVED, NOW]);
});

it("uses the oldest history record as the creation time", async () => {
  mockedHistory.mockResolvedValue({
    data: [{ recorded_at: CREATED }],
    error: undefined,
  } as never);

  const { result } = renderHookWithQuery(() => useSpgpqMilestones(spgpq, NOW));

  await waitFor(() =>
    expect(times(result.current)).toEqual([CREATED, APPROVED, NOW]),
  );
  expect(mockedHistory).toHaveBeenCalledWith({
    query: {
      service_providing_group_grid_prequalification_id: "eq.7",
      order: "recorded_at.asc",
      limit: "1",
    },
  });
});

it("leaves out the approval time when the SPG-GP is not approved", async () => {
  mockedHistory.mockReturnValue(new Promise(() => {}) as never);

  const { result } = renderHookWithQuery(() =>
    useSpgpqMilestones({ ...spgpq, prequalified_at: undefined }, NOW),
  );

  expect(times(result.current)).toEqual([undefined, undefined, NOW]);
});

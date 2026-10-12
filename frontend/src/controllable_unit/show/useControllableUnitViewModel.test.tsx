import { act, cleanup, renderHook, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import type { PropsWithChildren } from "react";
import { afterEach, expect, it, vi } from "vitest";
import {
  listControllableUnitServiceProvider,
  listControllableUnitSuspension,
  listTechnicalResource,
  readControllableUnit,
} from "../../generated-client";
import { useTechnicalResources } from "../technical_resource/useTechnicalResources";
import { useControllableUnitViewModel } from "./useControllableUnitViewModel";

vi.mock("../../generated-client", () => ({
  listControllableUnitServiceProvider: vi.fn(),
  listControllableUnitSuspension: vi.fn(),
  listTechnicalResource: vi.fn(),
  readControllableUnit: vi.fn(),
}));

afterEach(() => {
  cleanup();
  vi.clearAllMocks();
});

it("shares technical resources with other consumers and updates after invalidation", async () => {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  const wrapper = ({ children }: PropsWithChildren) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );

  vi.mocked(readControllableUnit).mockResolvedValue({
    data: { id: 42 },
  } as Awaited<ReturnType<typeof readControllableUnit>>);
  vi.mocked(listControllableUnitServiceProvider).mockResolvedValue({
    data: [],
    error: undefined,
  } as Awaited<ReturnType<typeof listControllableUnitServiceProvider>>);
  vi.mocked(listControllableUnitSuspension).mockResolvedValue({
    data: [],
    error: undefined,
  } as Awaited<ReturnType<typeof listControllableUnitSuspension>>);
  vi.mocked(listTechnicalResource).mockResolvedValue({
    data: [{ id: 1, maximum_active_power: 10 }],
  } as Awaited<ReturnType<typeof listTechnicalResource>>);

  const viewModel = renderHook(() => useControllableUnitViewModel(42), {
    wrapper,
  });
  await waitFor(() => expect(viewModel.result.current.isPending).toBe(false));

  const resources = renderHook(() => useTechnicalResources(42), { wrapper });
  expect(resources.result.current.data).toEqual([
    { id: 1, maximum_active_power: 10 },
  ]);
  expect(listTechnicalResource).toHaveBeenCalledTimes(1);
  expect(viewModel.result.current.data?.technicalResources).toBe(
    resources.result.current.data,
  );

  vi.mocked(listTechnicalResource).mockResolvedValue({
    data: [],
    error: undefined,
  } as Awaited<ReturnType<typeof listTechnicalResource>>);
  await act(async () => {
    await queryClient.invalidateQueries({
      queryKey: ["technical_resource", { controllable_unit_id: 42 }],
    });
  });

  await waitFor(() => {
    expect(viewModel.result.current.data?.technicalResources).toEqual([]);
    expect(resources.result.current.data).toEqual([]);
  });
  expect(listTechnicalResource).toHaveBeenCalledTimes(2);
  expect(readControllableUnit).toHaveBeenCalledTimes(1);
  queryClient.clear();
});

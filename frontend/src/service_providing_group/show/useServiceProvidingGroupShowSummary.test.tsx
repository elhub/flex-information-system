import { beforeEach, expect, it, vi } from "vitest";
import { renderHook } from "@testing-library/react";
import { useServiceProvidingGroupShowSummary } from "./useServiceProvidingGroupShowSummary";
import { useParty } from "../../hooks/party";
import { useTranslateEnum } from "../../intl/intl";
import type { ServiceProvidingGroup } from "../../generated-client";
import { toDateTimeString } from "../../util";

vi.mock("../../hooks/party", () => ({
  useParty: vi.fn(),
}));

vi.mock("../../intl/intl", () => ({
  useTranslateEnum: vi.fn(),
}));

const mockedUseParty = vi.mocked(useParty);
const mockedUseTranslateEnum = vi.mocked(useTranslateEnum);

// Mock data
const spgWith = (
  fields: Partial<ServiceProvidingGroup>,
): ServiceProvidingGroup =>
  ({
    id: 1,
    service_provider_id: 10,
    bidding_zone: "NO1",
    created_at: "2024-01-01T12:00:00Z",
    ...fields,
  }) as unknown as ServiceProvidingGroup;

beforeEach(() => {
  mockedUseParty.mockReset();
  mockedUseTranslateEnum.mockReset();
  mockedUseParty.mockReturnValue({
    data: { name: "Acme Energy" },
    error: undefined,
  } as unknown as ReturnType<typeof useParty>);
  mockedUseTranslateEnum.mockReturnValue((key: string) => `translated:${key}`);
});

it("returns the service provider, bidding zone and created at fields", () => {
  const spg = spgWith({});

  const { result } = renderHook(() =>
    useServiceProvidingGroupShowSummary({ spg }),
  );

  expect(result.current).toEqual([
    {
      labelKey: "service_providing_group.service_provider_id",
      value: "Acme Energy",
    },
    {
      labelKey: "service_providing_group.bidding_zone",
      value: "translated:service_providing_group.bidding_zone.NO1",
    },
    {
      labelKey: "service_providing_group.created_at",
      value: toDateTimeString(spg.created_at),
    },
  ]);
});

it("passes the service providing group's service_provider_id to useParty", () => {
  const spg = spgWith({ service_provider_id: 42 });

  renderHook(() => useServiceProvidingGroupShowSummary({ spg }));

  expect(mockedUseParty).toHaveBeenCalledWith(42);
});

it("throws when useParty errors", () => {
  const error = new Error("failed to load party");
  mockedUseParty.mockReturnValue({
    data: undefined,
    error,
  } as unknown as ReturnType<typeof useParty>);

  expect(() =>
    renderHook(() => useServiceProvidingGroupShowSummary({ spg: spgWith({}) })),
  ).toThrow(error);
});

it("handles an undefined service providing group", () => {
  const { result } = renderHook(() =>
    useServiceProvidingGroupShowSummary({ spg: undefined }),
  );

  expect(mockedUseParty).toHaveBeenCalledWith(undefined);
  expect(result.current).toEqual([
    {
      labelKey: "service_providing_group.service_provider_id",
      value: "Acme Energy",
    },
    {
      labelKey: "service_providing_group.bidding_zone",
      value: undefined,
    },
    {
      labelKey: "service_providing_group.created_at",
      value: undefined,
    },
  ]);
});

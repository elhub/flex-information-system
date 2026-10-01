import { beforeEach, expect, it, vi } from "vitest";
import { renderHook } from "@testing-library/react";
import { useGetIdentity } from "react-admin";
import { useServiceProvidingGroupAlerts } from "./useServiceProvidingGroupAlert";
import { useSpgProductApplications } from "./useSpgProductApplications";
import type { ServiceProvidingGroup } from "../../generated-client";

vi.mock("react-admin", () => ({
  useGetIdentity: vi.fn(),
}));

vi.mock("./useSpgProductApplications", () => ({
  useSpgProductApplications: vi.fn(),
}));

const mockedUseGetIdentity = vi.mocked(useGetIdentity);
const mockedUseSpgProductApplications = vi.mocked(useSpgProductApplications);

const spgWithStatus = (status: string): ServiceProvidingGroup =>
  ({ id: 1, status }) as unknown as ServiceProvidingGroup;

beforeEach(() => {
  mockedUseGetIdentity.mockReset();
  mockedUseSpgProductApplications.mockReset();
  mockedUseSpgProductApplications.mockReturnValue({
    data: undefined,
  } as unknown as ReturnType<typeof useSpgProductApplications>);
});

it("returns undefined when there is no service providing group", () => {
  mockedUseGetIdentity.mockReturnValue({
    data: { role: "flex_service_provider" },
  } as unknown as ReturnType<typeof useGetIdentity>);

  const { result } = renderHook(() =>
    useServiceProvidingGroupAlerts(undefined),
  );

  expect(result.current).toBeUndefined();
});

it("returns undefined when the user is not a service provider", () => {
  mockedUseGetIdentity.mockReturnValue({
    data: { role: "flex_system_operator" },
  } as unknown as ReturnType<typeof useGetIdentity>);

  const { result } = renderHook(() =>
    useServiceProvidingGroupAlerts(spgWithStatus("active")),
  );

  expect(result.current).toBeUndefined();
});

it("warns that the service providing group is not active when status is new", () => {
  mockedUseGetIdentity.mockReturnValue({
    data: { role: "flex_service_provider" },
  } as unknown as ReturnType<typeof useGetIdentity>);

  const { result } = renderHook(() =>
    useServiceProvidingGroupAlerts(spgWithStatus("new")),
  );

  expect(result.current).toEqual({
    severity: "info",
    heading: "Service providing group is not active",
    body: "Activating the service providing group will allow it to be used in a product application.",
  });
});

it("informs about missing product applications when the group is active but has none", () => {
  mockedUseGetIdentity.mockReturnValue({
    data: { role: "flex_service_provider" },
  } as unknown as ReturnType<typeof useGetIdentity>);
  mockedUseSpgProductApplications.mockReturnValue({
    data: [],
  } as unknown as ReturnType<typeof useSpgProductApplications>);

  const { result } = renderHook(() =>
    useServiceProvidingGroupAlerts(spgWithStatus("active")),
  );

  expect(result.current).toEqual({
    severity: "info",
    heading: "No product application",
    body: "There are no product applications for this service providing group.",
  });
});

it("returns undefined when the group is active and has product applications", () => {
  mockedUseGetIdentity.mockReturnValue({
    data: { role: "flex_service_provider" },
  } as unknown as ReturnType<typeof useGetIdentity>);
  mockedUseSpgProductApplications.mockReturnValue({
    data: [{ id: 1 }],
  } as unknown as ReturnType<typeof useSpgProductApplications>);

  const { result } = renderHook(() =>
    useServiceProvidingGroupAlerts(spgWithStatus("active")),
  );

  expect(result.current).toBeUndefined();
});

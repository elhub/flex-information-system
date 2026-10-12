import { cleanup, render, screen } from "@testing-library/react";
import type { PropsWithChildren } from "react";
import { afterEach, describe, expect, it, vi } from "vitest";
import type { TechnicalResource } from "../../generated-client";
import { useTechnicalResources } from "../technical_resource/useTechnicalResources";
import { ControllableUnitTechnicalResourceSummary } from "./ControllableUnitTechnicalResourceSummary";

vi.mock("../technical_resource/useTechnicalResources", () => ({
  useTechnicalResources: vi.fn(),
}));

vi.mock("../../components/ui", () => {
  const Container = ({ children }: PropsWithChildren) => <div>{children}</div>;
  return {
    Heading: Container,
    Panel: Container,
    Loader: Container,
    BodyText: Container,
    Link: Container,
  };
});

afterEach(cleanup);

describe("ControllableUnitTechnicalResourceSummary", () => {
  it.each([
    {
      name: "an empty list",
      powers: [],
      count: 0,
      sum: 0,
      average: 0,
      min: 0,
      max: 0,
    },
    {
      name: "multiple technical resources",
      powers: [10, 20, 40],
      count: 3,
      sum: 70,
      average: 23.33,
      min: 10,
      max: 40,
    },
    {
      name: "a zero-power resource",
      powers: [0, 10, 10],
      count: 3,
      sum: 20,
      average: 6.67,
      min: 0,
      max: 10,
    },
  ])("summarizes $name", ({ powers, count, sum, average, min, max }) => {
    vi.mocked(useTechnicalResources).mockReturnValue({
      data: powers.map(
        (power, index) =>
          ({ id: index + 1, maximum_active_power: power }) as TechnicalResource,
      ),
      isLoading: false,
      error: null,
    } as ReturnType<typeof useTechnicalResources>);

    render(
      <ControllableUnitTechnicalResourceSummary controllableUnitId={42} />,
    );

    expect(useTechnicalResources).toHaveBeenCalledWith(42);
    expect(
      screen.getByText(/This controllable unit contains/),
    ).toHaveTextContent(
      `This controllable unit contains ${count} technical resources.`,
    );
    for (const [label, value] of [
      ["Aggregated rated power", `${sum} kW`],
      ["Average rated power", `${average} kW`],
      ["Minimum rated power", `${min} kW`],
      ["Maximum rated power", `${max} kW`],
    ]) {
      expect(screen.getByText(`${label}:`).parentElement).toHaveTextContent(
        value,
      );
    }
  });
});

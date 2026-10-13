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
    Card: Container,
    CardContent: Container,
    CardHeader: Container,
    CardHeaderContent: Container,
    CardTitle: Container,
    Loader: Container,
    Panel: Container,
    Heading: Container,
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
      expectedValues: ["0 kW", "0 kW", "0 kW", "0 kW"],
    },
    {
      name: "multiple technical resources",
      powers: [10, 20, 40],
      expectedValues: ["70 kW", "23.33 kW", "10 kW", "40 kW"],
    },
    {
      name: "a zero-power resource",
      powers: [0, 10, 10],
      expectedValues: ["20 kW", "6.67 kW", "0 kW", "10 kW"],
    },
  ])("summarizes $name", ({ powers, expectedValues }) => {
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
    const displayedValues = screen
      .getAllByText(/ kW$/)
      .map((element) => element.textContent)
      .sort();
    expect(displayedValues).toEqual([...expectedValues].sort());
  });
});

import { Heading, Link, Panel } from "../../components/ui";
import { LabelValue } from "../../components/LabelValue";
import { Column, SimpleTable } from "../../components/SimpleTable";
import { useTranslateEnum } from "../../intl/intl";
import { PieChart, Pie, Sector, ResponsiveContainer } from "recharts";
import type { SectorProps } from "recharts";
import type { PieSectorShapeProps } from "recharts/types/polar/Pie";
import type {
  ServiceProvidingGroupSummary,
  Category,
  Technology,
} from "../../generated-client";
import { SpgShowViewModel } from "./useSpgShowViewModel";

type Props = {
  spgViewModel: SpgShowViewModel;
  summary: ServiceProvidingGroupSummary;
};

// TODO: should this be moved to the theme config ?
const CHART_COLOR_GREEN = "#686f38"; // global-color-chart-series-3
const CHART_COLOR_BLUE = "#4f97c8"; // global-color-chart-series-2
const CHART_COLOR_ORANGE = "#dc712f"; // global-color-chart-series-7
const CHART_COLOR_FALLBACK = "#5a776f"; // global-color-chart-series-4
const CHART_SECTOR_STROKE = "#ffffff";

const CATEGORY_COLORS: Record<string, string> = {
  production: CHART_COLOR_GREEN,
  consumption: CHART_COLOR_BLUE,
  energy_storage: CHART_COLOR_ORANGE,
};

type TechnologyRow = {
  id: string;
  technology: string;
  count: number;
  sum: number;
  average: number;
  min: number | undefined;
  max: number | undefined;
};

const formatKw = (value: number | undefined) =>
  value !== undefined ? `${Math.round(value * 100) / 100} kW` : "-";

export const ServiceProvidingGroupShowSPGSummarySection = ({
  spgViewModel,
  summary,
}: Props) => {
  const translateEnum = useTranslateEnum();

  const { controllable_unit: cu, technical_resource: tr } = summary;

  // technology table

  const byTechnology = tr.by_technology ?? {};
  const technologyRows: TechnologyRow[] = Object.entries(byTechnology).map(
    ([tech, stats]) => ({
      id: tech,
      technology: translateEnum(`technology.${tech as Technology}`),
      count: stats?.count ?? 0,
      sum: stats?.maximum_active_power?.sum ?? 0,
      average: stats?.maximum_active_power?.average ?? 0,
      min: stats?.maximum_active_power?.min,
      max: stats?.maximum_active_power?.max,
    }),
  );

  const technologyColumns: Column<TechnologyRow>[] = [
    { key: "technology", header: "Technology" },
    {
      key: "count",
      header: "Technical resources",
      render: (v) => <div className="text-right">{String(v)}</div>,
    },
    {
      key: "sum",
      header: "Aggregated maximum active power (kW)",
      render: (v) => <div className="text-right">{formatKw(v as number)}</div>,
    },
    {
      key: "average",
      header: "Average (kW)",
      render: (v) => <div className="text-right">{formatKw(v as number)}</div>,
    },
    {
      key: "min",
      header: "Min (kW)",
      render: (v) => (
        <div className="text-right">{formatKw(v as number | undefined)}</div>
      ),
    },
    {
      key: "max",
      header: "Max (kW)",
      render: (v) => (
        <div className="text-right">{formatKw(v as number | undefined)}</div>
      ),
    },
  ];

  // category pie chart

  const byCategory = tr.by_category ?? {};
  const categoryData = Object.entries(byCategory).map(([cat, stats]) => ({
    name: translateEnum(`category.${cat as Category}`),
    value: stats?.maximum_active_power?.sum ?? 0,
    key: cat,
  }));

  return (
    <div className="flex flex-col gap-6">
      <p>
        Here are the aggregated maximum active power values for this service
        providing group. We explain what these values correspond to in{" "}
        <Link
          external
          href="https://elhub.github.io/flex-information-system/concepts/technologies/#maximum-active-power-as-size"
        >
          our documentation
        </Link>
        {" ."}
      </p>
      <div className="grid grid-cols-2">
        <LabelValue
          size="large"
          label="Aggregated maximum flexible active power"
          value={spgViewModel.totalCapacityKw}
          unit="kW"
        />
        <LabelValue
          size="large"
          label="Aggregated maximum active power"
          value={cu.maximum_active_power?.sum}
          unit="kW"
        />
      </div>
      <div className="grid grid-cols-3 gap-4">
        {technologyRows.length > 0 && (
          <SimpleTable
            size="small"
            data={technologyRows}
            columns={technologyColumns}
            className="col-span-2 w-full"
          />
        )}
        {categoryData.length > 0 && (
          <Panel
            border
            className="bg-semantic-background-alternative h-fit p-4 sm:p-5"
          >
            <Heading size="small">
              Aggregated maximum active power by category
            </Heading>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  // remove outline on chart piece click
                  style={{ outline: "none" }}
                  data={categoryData}
                  innerRadius={25}
                  outerRadius={80}
                  label={({ name, value }) => `${name}: ${formatKw(value)}`}
                  shape={(props: PieSectorShapeProps) => (
                    <Sector
                      {...(props as SectorProps)}
                      fill={
                        CATEGORY_COLORS[
                          categoryData[props.index ?? 0]?.key ?? ""
                        ] ?? CHART_COLOR_FALLBACK
                      }
                      stroke={CHART_SECTOR_STROKE}
                      strokeWidth={2}
                    />
                  )}
                  isAnimationActive={false}
                />
              </PieChart>
            </ResponsiveContainer>
          </Panel>
        )}
      </div>
    </div>
  );
};

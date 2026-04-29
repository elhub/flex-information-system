import type {
  ServiceProvidingGroupSummary,
  Category,
  Technology,
} from "../../generated-client";
import { useTranslateEnum } from "../../intl/intl";
import { PieChart, Pie, Sector, ResponsiveContainer } from "recharts";
import type { SectorProps, PieLabelRenderProps } from "recharts";
import type { PieSectorShapeProps } from "recharts/types/polar/Pie";
import { Column, SimpleTable } from "../../components/SimpleTable";
import { Heading, Panel, Tabs } from "../../components/ui";
import { LabelValue } from "../../components/LabelValue";

const formatKw = (value: number | undefined) =>
  value !== undefined ? `${Math.round(value * 100) / 100} kW` : "-";

type Props = {
  summary: ServiceProvidingGroupSummary;
  showDetails?: boolean;
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

const CHART_COLOR_FALLBACK = "var(--eds-global-color-chart-series-4)";
const CHART_SECTOR_STROKE = "#ffffff";

const CATEGORY_COLORS: Record<string, string> = {
  production: "var(--eds-global-color-chart-series-3)",
  consumption: "var(--eds-global-color-chart-series-2)",
  energy_storage: "var(--eds-global-color-chart-series-7)",
};

export const ServiceProvidingGroupTechnicalResourceSummary = ({
  summary,
  showDetails = false,
}: Props) => {
  const { technical_resource: tr } = summary;

  return (
    <Panel border className="h-fit p-4 sm:p-5 flex flex-col gap-4">
      <Heading size="large">Technical resource summary</Heading>
      <p>
        This service providing group contains <b>{tr.count ?? 0}</b> technical
        resources. Here are the <b>rated power</b> aggregates computed across
        all of them:
      </p>
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <LabelValue
          label="Aggregated rated power"
          value={tr.maximum_active_power?.sum ?? 0}
          unit="kW"
        />
        <LabelValue
          label="Average rated power"
          value={
            tr.maximum_active_power?.average
              ? Math.round(tr.maximum_active_power.average * 100) / 100
              : 0
          }
          unit="kW"
        />
        <LabelValue
          label="Minimum rated power"
          value={tr.maximum_active_power?.min ?? 0}
          unit="kW"
        />
        <LabelValue
          label="Maximum rated power"
          value={tr.maximum_active_power?.max ?? 0}
          unit="kW"
        />
      </div>
      {showDetails && (
        <ServiceProvidingGroupTechnicalResourceSummaryDetails
          summary={summary}
        />
      )}
    </Panel>
  );
};

const ServiceProvidingGroupTechnicalResourceSummaryDetails = ({
  summary,
}: {
  summary: ServiceProvidingGroupSummary;
}) => {
  const translateEnum = useTranslateEnum();
  const { technical_resource: tr } = summary;

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
      header: "Number of technical resources",
      render: (v) => <div className="text-right">{String(v)}</div>,
    },
    {
      key: "sum",
      header: "Aggregated rated power",
      render: (v) => <div className="text-right">{formatKw(v as number)}</div>,
    },
    {
      key: "average",
      header: "Average rated power",
      render: (v) => <div className="text-right">{formatKw(v as number)}</div>,
    },
    {
      key: "min",
      header: "Minimum rated power",
      render: (v) => (
        <div className="text-right">{formatKw(v as number | undefined)}</div>
      ),
    },
    {
      key: "max",
      header: "Maximum rated power",
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
      <Tabs defaultValue="technology">
        <Tabs.List>
          <Tabs.Tab label="Breakdown by technology" value="technology" />
          <Tabs.Tab label="Breakdown by category" value="category" />
        </Tabs.List>
        <Tabs.Panel value="technology">
          {technologyRows.length > 0 && (
            <div className="pt-4">
              <SimpleTable
                size="small"
                data={technologyRows}
                columns={technologyColumns}
                className="w-full"
              />
            </div>
          )}
        </Tabs.Panel>
        <Tabs.Panel value="category">
          {categoryData.length > 0 && (
            <div className="pt-4">
              <Panel
                border
                className="bg-semantic-background-alternative h-fit p-4 sm:p-5"
              >
                <Heading size="small">
                  Aggregated rated power by category
                </Heading>
                <ResponsiveContainer width="100%" height={500}>
                  <PieChart>
                    <Pie
                      // remove outline on chart piece click
                      style={{ outline: "none" }}
                      data={categoryData}
                      innerRadius={50}
                      outerRadius={150}
                      label={({ name, value }: PieLabelRenderProps) =>
                        `${name}: ${formatKw(value as number | undefined)}`
                      }
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
            </div>
          )}
        </Tabs.Panel>
      </Tabs>
    </div>
  );
};

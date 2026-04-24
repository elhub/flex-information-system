import { Heading, Panel } from "../../components/ui";
import { LabelValue } from "../../components/LabelValue";
import { Column, SimpleTable } from "../../components/SimpleTable";
import { useTranslateEnum } from "../../intl/intl";
import {
  PieChart,
  Pie,
  Sector,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import type { SectorProps } from "recharts";
import type { PieSectorShapeProps } from "recharts/types/polar/Pie";
import type {
  ServiceProvidingGroupSummary,
  Category,
  Technology,
} from "../../generated-client";

type Props = {
  summary: ServiceProvidingGroupSummary;
};

const CATEGORY_COLORS: Record<string, string> = {
  production: "#4ade80",
  consumption: "#60a5fa",
  energy_storage: "#fbbf24",
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

export const SpgSummarySection = ({ summary }: Props) => {
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
      header: "Sum (kW)",
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
    <Panel border className="p-4 mt-6">
      <div className="flex flex-col gap-6">
        <Heading level="h4" className="mb-4">
          Aggregated information
        </Heading>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <LabelValue label="Controllable units" value={cu.count ?? 0} />
          <LabelValue
            label="Aggregated maximum active power"
            value={cu.maximum_active_power?.sum}
            unit="kW"
          />
          <LabelValue
            label="Average"
            value={
              cu.maximum_active_power?.average !== undefined
                ? Math.round(cu.maximum_active_power.average * 100) / 100
                : undefined
            }
            unit="kW"
          />
          <LabelValue
            label="Minimum"
            value={cu.maximum_active_power?.min}
            unit="kW"
          />
          <LabelValue
            label="Maximum"
            value={cu.maximum_active_power?.max}
            unit="kW"
          />
        </div>
        <div className="grid grid-cols-2 gap-4">
          {technologyRows.length > 0 && (
            <SimpleTable
              size="small"
              data={technologyRows}
              columns={technologyColumns}
              className="w-full"
            />
          )}
          {categoryData.length > 0 && (
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={categoryData}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={100}
                  label={({ name, value }) => `${name}: ${formatKw(value)}`}
                  shape={(props: PieSectorShapeProps) => (
                    <Sector
                      {...(props as SectorProps)}
                      fill={
                        CATEGORY_COLORS[
                          categoryData[props.index ?? 0]?.key ?? ""
                        ] ?? "#94a3b8"
                      }
                    />
                  )}
                />
                <Tooltip
                  formatter={(value) => formatKw(value as number | undefined)}
                />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>
    </Panel>
  );
};

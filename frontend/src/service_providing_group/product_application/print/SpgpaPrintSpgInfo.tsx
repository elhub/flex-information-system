import { Heading } from "../../../components/ui";
import { LabelValue } from "../../../components/LabelValue";
import { useTranslateEnum } from "../../../intl/intl";
import { ServiceProvidingGroup } from "../../../generated-client";
import type { SpgShowViewModel } from "../../show/useSpgShowViewModel";
import { SpgpaPrintCuSummary } from "./SpgpaPrintCuSummary";
import { Column, SimpleTable } from "../../../components/SimpleTable";
import type { Technology } from "../../../generated-client";

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

type Props = {
  spg: ServiceProvidingGroup;
  spgViewModel: SpgShowViewModel;
};

export const SpgpaPrintSpgInfo = ({ spg, spgViewModel }: Props) => {
  const translateEnum = useTranslateEnum();

  const statusLabel = translateEnum(
    `service_providing_group.status.${spg.status}`,
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

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-4">
        <LabelValue label="Name" value={spg.name} />
        <LabelValue label="Bidding zone" value={spg.bidding_zone} />
        <LabelValue label="Status" value={statusLabel} />
      </div>

      {spg.summary && (
        <>
          <SpgpaPrintCuSummary
            spgViewModel={spgViewModel}
            summary={spg.summary}
          />

          <div className="flex flex-col gap-4">
            <Heading size="large">Technical resource summary</Heading>
            <p>
              This service providing group contains{" "}
              <b>{spg.summary.technical_resource.count ?? 0}</b> technical
              resources. Here are the <b>rated power</b> aggregates computed
              across all of them:
            </p>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              <LabelValue
                label="Aggregated rated power"
                value={
                  spg.summary.technical_resource.maximum_active_power?.sum ?? 0
                }
                unit="kW"
              />
              <LabelValue
                label="Average rated power"
                value={
                  spg.summary.technical_resource.maximum_active_power?.average
                    ? Math.round(
                        spg.summary.technical_resource.maximum_active_power
                          .average * 100,
                      ) / 100
                    : 0
                }
                unit="kW"
              />
              <LabelValue
                label="Minimum rated power"
                value={
                  spg.summary.technical_resource.maximum_active_power?.min ?? 0
                }
                unit="kW"
              />
              <LabelValue
                label="Maximum rated power"
                value={
                  spg.summary.technical_resource.maximum_active_power?.max ?? 0
                }
                unit="kW"
              />
            </div>

            {/* Breakdown by technology table */}
            {(() => {
              const byTechnology =
                spg.summary.technical_resource.by_technology ?? {};
              const technologyRows: TechnologyRow[] = Object.entries(
                byTechnology,
              ).map(([tech, stats]) => ({
                id: tech,
                technology: translateEnum(`technology.${tech as Technology}`),
                count: stats?.count ?? 0,
                sum: stats?.maximum_active_power?.sum ?? 0,
                average: stats?.maximum_active_power?.average ?? 0,
                min: stats?.maximum_active_power?.min,
                max: stats?.maximum_active_power?.max,
              }));

              return technologyRows.length > 0 ? (
                <div className="flex flex-col gap-2">
                  <Heading size="small">Breakdown by technology</Heading>
                  <SimpleTable
                    size="small"
                    data={technologyRows}
                    columns={technologyColumns}
                    className="w-full"
                  />
                </div>
              ) : null;
            })()}
          </div>
        </>
      )}
    </div>
  );
};

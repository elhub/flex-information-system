import { Loader } from "../../components/ui";
import { Column, SimpleTable } from "../../components/SimpleTable";
import {
  SubstationRow,
  useSpgPowerPerSubstation,
} from "./useSpgPowerPerSubstation";
import { formatScaled, KILO, Scale } from "../../utils/scales";

type Props = {
  spgId: number;
  powerScale: Scale;
};

export const ServiceProvidingGroupShowPowerPerSubstationTable = ({
  spgId,
  powerScale,
}: Props) => {
  const { data, isLoading, error } = useSpgPowerPerSubstation(spgId);

  const formatPower = (value: number | undefined) =>
    formatScaled(value, "W", KILO, powerScale);

  const columns: Column<SubstationRow>[] = [
    {
      key: "substationName",
      header: "Substation",
      render: (v, row) =>
        v
          ? String(v)
          : row.substationBusinessId
            ? String(row.substationBusinessId)
            : "(unassigned)",
    },
    {
      key: "substationBusinessId",
      header: "Business ID",
      render: (v) => (v ? String(v) : "-"),
    },
    {
      key: "controllableUnitCount",
      header: "Controllable units",
      render: (v) => <div className="text-right">{String(v)}</div>,
    },
    {
      key: "maximumActivePowerSum",
      header: "Aggregated rated power",
      render: (v) => (
        <div className="text-right">{formatPower(v as number | undefined)}</div>
      ),
    },
    {
      key: "maximumActivePowerAverage",
      header: "Average rated power",
      render: (v) => {
        const n = v as number | undefined;
        return (
          <div className="text-right">
            {formatPower(
              n !== undefined ? Math.round(n * 100) / 100 : undefined,
            )}
          </div>
        );
      },
    },
    {
      key: "maximumActivePowerMin",
      header: "Minimum rated power",
      render: (v) => (
        <div className="text-right">{formatPower(v as number | undefined)}</div>
      ),
    },
    {
      key: "maximumActivePowerMax",
      header: "Maximum rated power",
      render: (v) => (
        <div className="text-right">{formatPower(v as number | undefined)}</div>
      ),
    },
  ];

  if (isLoading) {
    return <Loader />;
  }

  if (error) {
    throw error;
  }

  return (
    <SimpleTable
      size="small"
      data={data ?? []}
      columns={columns}
      className="w-full"
    />
  );
};

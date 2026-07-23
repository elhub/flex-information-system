import { Loader } from "../../components/ui";
import { Column, SimpleTable } from "../../components/SimpleTable";
import {
  SubstationRow,
  useSpgPowerPerSubstation,
} from "./useSpgPowerPerSubstation";

type Props = {
  spgId: number;
};

const formatKw = (value: number | undefined) =>
  value !== undefined ? `${Math.round(value * 100) / 100} kW` : "-";

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
    header: "Aggregated flexible power",
    render: (v) => (
      <div className="text-right">{formatKw(v as number | undefined)}</div>
    ),
  },
  {
    key: "maximumActivePowerAverage",
    header: "Average flexible power",
    render: (v) => {
      const n = v as number | undefined;
      return (
        <div className="text-right">
          {formatKw(n !== undefined ? Math.round(n * 100) / 100 : undefined)}
        </div>
      );
    },
  },
  {
    key: "maximumActivePowerMin",
    header: "Minimum flexible power",
    render: (v) => (
      <div className="text-right">{formatKw(v as number | undefined)}</div>
    ),
  },
  {
    key: "maximumActivePowerMax",
    header: "Maximum flexible power",
    render: (v) => (
      <div className="text-right">{formatKw(v as number | undefined)}</div>
    ),
  },
];

export const ServiceProvidingGroupShowPowerPerSubstationTable = ({
  spgId,
}: Props) => {
  const { data, isLoading, error } = useSpgPowerPerSubstation(spgId);

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

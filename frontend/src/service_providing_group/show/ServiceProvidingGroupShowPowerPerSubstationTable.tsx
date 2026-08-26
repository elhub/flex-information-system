import { Loader } from "../../components/ui";
import { Column, SimpleTable } from "../../components/SimpleTable";
import {
  SubstationRow,
  useSpgPowerPerSubstation,
} from "./useSpgPowerPerSubstation";
import { formatScaled, KILO, Scale } from "../../utils/scales";
import { PowerRatio } from "../../components/PowerRatio";

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
      header: "Aggregated flexible power",
      render: (v, row) => (
        <div className="flex items-center justify-end gap-3">
          <span>{formatPower(v as number | undefined)}</span>
          <PowerRatio
            flexiblePower={v as number | undefined}
            ratedPower={row.ratedPowerSum}
          />
        </div>
      ),
    },
    {
      key: "ratedPowerSum",
      header: "Aggregated rated power",
      render: (v) => (
        <div className="text-right">{formatPower(v as number | undefined)}</div>
      ),
    },
    {
      key: "ratedPowerMin",
      header: "Minimum rated power",
      render: (v) => (
        <div className="text-right">{formatPower(v as number | undefined)}</div>
      ),
    },
    {
      key: "ratedPowerMax",
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

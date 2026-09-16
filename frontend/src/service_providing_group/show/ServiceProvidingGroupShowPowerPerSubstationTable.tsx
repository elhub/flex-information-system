import { Loader } from "../../components/ui";
import { Column, SimpleTable } from "../../components/SimpleTable";
import {
  SubstationRow,
  useSpgPowerPerSubstation,
} from "./useSpgPowerPerSubstation";
import {
  controllableUnitsForSubstation,
  SpgControllableUnitRow,
  useSpgControllableUnits,
} from "./useSpgControllableUnits";
import { formatScaled, KILO, Scale } from "../../utils/scales";
import { PowerRatio } from "../../components/PowerRatio";
import { useTranslate } from "ra-core";

type Props = {
  spgId: number;
  powerScale: Scale;
};

export const ServiceProvidingGroupShowPowerPerSubstationTable = ({
  spgId,
  powerScale,
}: Props) => {
  const { data, isLoading, error } = useSpgPowerPerSubstation(spgId);
  const { data: cus } = useSpgControllableUnits(spgId);
  const translate = useTranslate();

  const formatPower = (value: number | undefined) =>
    formatScaled(value, "W", KILO, powerScale);

  const controllableUnitColumns: Column<SpgControllableUnitRow>[] = [
    {
      key: "name",
      header: translate("text.table.header.name"),
    },
    {
      key: "status",
      header: translate("text.table.header.status"),
    },
    {
      key: "validFrom",
      header: translate("text.table.header.valid_from"),
    },
    {
      key: "validTo",
      header: translate("text.table.header.valid_to"),
    },
    {
      key: "maximum_active_power",
      header: translate("text.table.header.max_active_power"),
      render: (value) => (
        <div className="text-right">
          {formatPower(value as number | undefined)}
        </div>
      ),
    },
    {
      key: "rated_power",
      header: translate("text.table.header.rated_power"),
      render: (value) => (
        <div className="text-right">
          {formatPower(value as number | undefined)}
        </div>
      ),
    },
    {
      key: "regulation_direction",
      header: translate("text.table.header.regulation_direction"),
    },
  ];

  const columns: Column<SubstationRow>[] = [
    {
      key: "substationName",
      header: translate("text.table.header.substation"),
      render: (v, row) =>
        v
          ? String(v)
          : row.substationBusinessId
            ? String(row.substationBusinessId)
            : translate("text.table.cell.unassigned"),
    },
    {
      key: "substationBusinessId",
      header: translate("text.table.header.business_id"),
      render: (v) => (v ? String(v) : "-"),
    },
    {
      key: "controllableUnitCount",
      header: translate("text.table.header.controllable_units"),
      render: (v) => <div className="text-right">{String(v)}</div>,
    },
    {
      key: "maximumActivePowerSum",
      header: translate("text.table.header.aggregated_flexible_power"),
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
      header: translate("text.table.header.aggregated_rated_power"),
      render: (v) => (
        <div className="text-right">{formatPower(v as number | undefined)}</div>
      ),
    },
    {
      key: "ratedPowerMin",
      header: translate("text.table.header.minimum_rated_power"),
      render: (v) => (
        <div className="text-right">{formatPower(v as number | undefined)}</div>
      ),
    },
    {
      key: "ratedPowerMax",
      header: translate("text.table.header.maximum_rated_power"),
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
      expandPanel={(row: SubstationRow) => {
        const rows = controllableUnitsForSubstation(
          cus,
          row.substationBusinessId,
        );
        return (
          <SimpleTable
            columns={controllableUnitColumns}
            data={rows}
            className="w-full p-0"
          />
        );
      }}
      data={data ?? []}
      columns={columns}
      className="w-full"
    />
  );
};

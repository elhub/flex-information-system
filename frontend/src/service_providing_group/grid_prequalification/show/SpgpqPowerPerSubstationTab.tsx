import { useState } from "react";
import { useTranslate } from "ra-core";
import { Loader } from "../../../components/ui";
import { Column, SimpleTable } from "../../../components/SimpleTable";
import { formatScaled, KILO, Scale } from "../../../utils/scales";
import { useSpgControllableUnitsMap } from "../../show/useSpgControllableUnits";
import { SpgSubstationControllableUnitsTable } from "../../show/SpgSubstationControllableUnitsTable";
import {
  SpgpqSubstationPowerRow,
  useSpgpqSubstationPower,
} from "./useSpgpqSubstationPower";

type Props = {
  spgId: number;
  spgpqId: number;
  powerScale: Scale;
};

export const SpgpqPowerPerSubstationTab = ({
  spgId,
  spgpqId,
  powerScale,
}: Props) => {
  const translate = useTranslate();
  const { data, isLoading, error } = useSpgpqSubstationPower(spgpqId);

  const [expanded, setExpanded] = useState<Set<string>>(new Set());
  const cuMap = useSpgControllableUnitsMap(spgId, Array.from(expanded));

  const formatPower = (value: number | undefined) =>
    formatScaled(value, "W", KILO, powerScale);

  const columns: Column<SpgpqSubstationPowerRow>[] = [
    {
      key: "substationName",
      header: translate("text.table.header.substation"),
      render: (v, row) => (v ? String(v) : row.substationBusinessId),
    },
    {
      key: "substationBusinessId",
      header: translate("text.table.header.business_id"),
    },
    {
      key: "controllableUnitCount",
      header: translate("text.table.header.controllable_units"),
      render: (v) => <div className="text-right">{String(v)}</div>,
    },
    {
      key: "maximumActivePowerSum",
      header: translate("text.table.header.aggregated_flexible_power"),
      render: (v) => (
        <div className="text-right">{formatPower(v as number | undefined)}</div>
      ),
    },
    {
      key: "totalApprovedMaximumActivePowerSum",
      header: translate("text.table.header.total_approved_flexible_power"),
      render: (v) => (
        <div className="text-right">{formatPower(v as number | undefined)}</div>
      ),
    },
  ];

  if (isLoading) return <Loader />;
  if (error) throw error;

  return (
    <SimpleTable
      expandPanel={(row) => (
        <SpgSubstationControllableUnitsTable
          data={cuMap.get(row.substationBusinessId) ?? []}
          powerScale={powerScale}
        />
      )}
      onExpand={(row, isOpen) =>
        setExpanded((prev) => {
          const next = new Set(prev);
          if (isOpen) next.add(row.substationBusinessId);
          else next.delete(row.substationBusinessId);
          return next;
        })
      }
      data={data ?? []}
      columns={columns}
      className="w-full"
    />
  );
};

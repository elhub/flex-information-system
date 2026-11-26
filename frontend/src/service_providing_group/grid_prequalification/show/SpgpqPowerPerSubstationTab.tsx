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
  impactedSystemOperatorId: number;
  // a PSO of the SPG sees all CUs of the group, others only the CUs of the
  // impacted system operator
  isPso: boolean;
};

export const SpgpqPowerPerSubstationTab = ({
  spgId,
  spgpqId,
  powerScale,
  impactedSystemOperatorId,
  isPso,
}: Props) => {
  const translate = useTranslate();
  const { data, isLoading, error } = useSpgpqSubstationPower(spgpqId);

  const [expanded, setExpanded] = useState<Set<string>>(new Set());
  const cuMap = useSpgControllableUnitsMap(
    spgId,
    Array.from(expanded),
    "name",
    isPso ? undefined : impactedSystemOperatorId,
  );

  const formatPower = (value: number | undefined) =>
    formatScaled(value, "W", KILO, powerScale);

  const columns: Column<SpgpqSubstationPowerRow>[] = [
    {
      key: "substationName",
      header: translate("text.table.header.substation"),
      render: (v, row) => (v ? String(v) : row.substationName),
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
          data={cuMap.get(row.substationName) ?? []}
          powerScale={powerScale}
        />
      )}
      onExpand={(row, isOpen) =>
        setExpanded((prev) => {
          const next = new Set(prev);
          if (isOpen) next.add(row.substationName);
          else next.delete(row.substationName);
          return next;
        })
      }
      data={data ?? []}
      columns={columns}
      className="w-full"
    />
  );
};

import { Loader } from "../../components/ui";
import { Column, SimpleTable } from "../../components/SimpleTable";
import {
  SubstationRow,
  useSpgPowerPerSubstation,
} from "./useSpgPowerPerSubstation";
import { useSpgControllableUnitsMap } from "./useSpgControllableUnits";
import { formatScaled, KILO, Scale } from "../../utils/scales";
import { PowerRatio } from "../../components/PowerRatio";
import { useTranslate } from "ra-core";
import { useState } from "react";
import { SpgSubstationControllableUnitsTable } from "./SpgSubstationControllableUnitsTable";

type Props = {
  spgId: number;
  powerScale: Scale;
};

export const ServiceProvidingGroupShowPowerPerSubstationTable = ({
  spgId,
  powerScale,
}: Props) => {
  const { data, isLoading, error } = useSpgPowerPerSubstation(spgId);
  const [expandedSubstationIds, setExpandedSubstationIds] = useState<
    Set<string>
  >(new Set());
  const cuMap = useSpgControllableUnitsMap(
    spgId,
    Array.from(expandedSubstationIds),
  );
  const translate = useTranslate();

  const formatPower = (value: number | undefined) =>
    formatScaled(value, "W", KILO, powerScale);

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
  ];

  if (isLoading) {
    return <Loader />;
  }

  if (error) {
    throw error;
  }

  return (
    <SimpleTable
      expandPanel={(row) => (
        <SpgSubstationControllableUnitsTable
          data={
            (row.substationBusinessId
              ? cuMap.get(row.substationBusinessId)
              : undefined) ?? []
          }
          powerScale={powerScale}
        />
      )}
      onExpand={(row, isOpen) => {
        if (!row.substationBusinessId) return;
        const substationBusinessId = row.substationBusinessId;
        setExpandedSubstationIds((prev) => {
          const next = new Set(prev);
          if (isOpen) {
            next.add(substationBusinessId);
          } else {
            next.delete(substationBusinessId);
          }
          return next;
        });
      }}
      data={data ?? []}
      columns={columns}
      className="w-full"
    />
  );
};

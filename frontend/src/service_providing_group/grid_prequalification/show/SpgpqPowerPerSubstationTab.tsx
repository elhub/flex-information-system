import { useTranslate } from "ra-core";
import { Loader } from "../../../components/ui";
import { Column, SimpleTable } from "../../../components/SimpleTable";
import { formatScaled, KILO, Scale } from "../../../utils/scales";
import {
  SpgpqSubstationPowerRow,
  useSpgpqSubstationPower,
} from "./useSpgpqSubstationPower";

type Props = {
  spgpqId: number;
  powerScale: Scale;
};

export const SpgpqPowerPerSubstationTab = ({ spgpqId, powerScale }: Props) => {
  const translate = useTranslate();
  const { data, isLoading, error } = useSpgpqSubstationPower(spgpqId);

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

  return <SimpleTable data={data ?? []} columns={columns} className="w-full" />;
};

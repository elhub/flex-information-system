import { Button, Loader } from "../../components/ui";
import { Column, SimpleTable } from "../../components/SimpleTable";
import {
  SubstationRow,
  useSpgPowerPerSubstation,
} from "./useSpgPowerPerSubstation";
import {
  SpgControllableUnitRow,
  useSpgControllableUnits,
} from "./useSpgControllableUnits";
import { formatScaled, KILO, Scale } from "../../utils/scales";
import { PowerRatio } from "../../components/PowerRatio";
import { useTranslate } from "ra-core";
import { useTranslateField } from "../../intl/intl";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { RegulationDirectionIcon } from "../../controllable_unit/RegulationDirectionField";
import { ControllableUnitRegulationDirection } from "../../generated-client/index";

type Props = {
  spgId: number;
  powerScale: Scale;
};

export const ServiceProvidingGroupShowPowerPerSubstationTable = ({
  spgId,
  powerScale,
}: Props) => {
  const { data, isLoading, error } = useSpgPowerPerSubstation(spgId);
  const [expandedSubstationId, setExpandedSubstationId] = useState<
    string | undefined
  >(undefined);
  const { data: cus } = useSpgControllableUnits(
    expandedSubstationId ? spgId : undefined,
    expandedSubstationId,
  );
  const translate = useTranslate();
  const t = useTranslateField();
  const navigate = useNavigate();

  const formatPower = (value: number | undefined) =>
    formatScaled(value, "W", KILO, powerScale);

  const controllableUnitColumns: Column<SpgControllableUnitRow>[] = [
    {
      key: "name",
      header: t("controllable_unit.name"),
    },
    {
      key: "validFrom",
      header: t("service_providing_group_membership.valid_from"),
    },
    {
      key: "validTo",
      header: t("service_providing_group_membership.valid_to"),
    },
    {
      key: "rated_power",
      header: t("technical_resource.maximum_active_power"),
      render: (value) => (
        <div className="text-right">
          {formatPower(value as number | undefined)}
        </div>
      ),
    },
    {
      key: "maximum_active_power",
      header: t("controllable_unit.maximum_active_power"),
      render: (value) => (
        <div className="text-right">
          {formatPower(value as number | undefined)}
        </div>
      ),
    },
    {
      key: "location",
      header: translate("text.technical_resources_show_label"),
      render: (_, row) => (
        <Button
          variant="secondary"
          onClick={() =>
            navigate(`/accounting_point/${row.accountingPointId}/show`)
          }
        >
          {translate("text.technical_resources_show_location")}
        </Button>
      ),
    },
    {
      key: "mpid",
      header: t("controllable_unit.accounting_point_id"),
    },
    {
      key: "brpName",
      header: t(
        "accounting_point_balance_responsible_party.balance_responsible_party_id",
      ),
    },
    {
      key: "regulation_direction",
      header: t("controllable_unit.regulation_direction"),
      render: (value) => (
        <RegulationDirectionIcon
          value={value as ControllableUnitRegulationDirection}
        />
      ),
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
      expandPanel={(_) => {
        return (
          <SimpleTable
            columns={controllableUnitColumns}
            data={cus ? cus : []}
            className="w-full p-0"
          />
        );
      }}
      onExpand={(row, isOpen) => {
        if (isOpen && row.substationBusinessId) {
          setExpandedSubstationId(row.substationBusinessId);
        }
      }}
      data={data ?? []}
      columns={columns}
      className="w-full"
    />
  );
};

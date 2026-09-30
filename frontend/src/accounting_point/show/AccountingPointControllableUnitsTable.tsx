import { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslate } from "ra-core";
import { BodyText, Loader } from "../../components/ui";
import { Column, SimpleTable } from "../../components/SimpleTable";
import { useTranslateField } from "../../intl/intl";
import { ControllableUnitRegulationDirection } from "../../generated-client";
import { RegulationDirectionIcon } from "../../controllable_unit/RegulationDirectionField";
import { cuStatusVariantMap } from "../../controllable_unit/controllableUnitStatus";
import { StatusBadge } from "../../components/StatusBadge";
import { formatScaled, KILO } from "../../utils/scales";
import {
  AccountingPointControllableUnitRow,
  useAccountingPointControllableUnits,
} from "./useAccountingPointControllableUnits";

type Props = {
  accountingPointId: number;
};

export const AccountingPointControllableUnitsTable = ({
  accountingPointId,
}: Props) => {
  const { data, isLoading, error } =
    useAccountingPointControllableUnits(accountingPointId);
  const navigate = useNavigate();
  const t = useTranslateField();
  const translate = useTranslate();

  const formatPower = (value: unknown) =>
    formatScaled(Number(value), "W", KILO);

  const columns = useMemo<Column<AccountingPointControllableUnitRow>[]>(
    () => [
      {
        key: "id",
        header: t("controllable_unit.id"),
      },
      {
        key: "name",
        header: t("controllable_unit.name"),
      },
      {
        key: "maximum_active_power",
        header: t("controllable_unit.maximum_active_power"),
        render: (value) => (
          <div className="text-right">{formatPower(value)}</div>
        ),
      },
      {
        key: "rated_power",
        header: t("technical_resource.maximum_active_power"),
        render: (value) => (
          <div className="text-right">
            {value != null ? formatPower(value) : "-"}
          </div>
        ),
      },
      {
        key: "status",
        header: t("controllable_unit.status"),
        render: (value) => {
          if (typeof value !== "string") {
            return "-";
          }

          const status = value as keyof typeof cuStatusVariantMap;
          const variant = cuStatusVariantMap[status];

          if (!variant) {
            return value;
          }

          return (
            <StatusBadge
              status={variant.status}
              icon={variant.icon}
              label={translate(`enum.controllable_unit.status.${status}`)}
            />
          );
        },
      },
      {
        key: "regulation_direction",
        header: t("controllable_unit.regulation_direction"),
        render: (value) =>
          value ? (
            <RegulationDirectionIcon
              value={value as ControllableUnitRegulationDirection}
            />
          ) : (
            "-"
          ),
      },
    ],
    [t, translate],
  );

  if (isLoading) {
    return <Loader />;
  }

  if (error) {
    throw error;
  }

  if (!data || data.rows.length === 0) {
    return (
      <BodyText>{translate("text.ap_controllable_units_table.empty")}</BodyText>
    );
  }

  return (
    <SimpleTable
      rowClick={(row) => navigate(`/controllable_unit/${row.id}/show`)}
      size="small"
      data={data.rows}
      columns={columns}
      className="w-full"
    />
  );
};

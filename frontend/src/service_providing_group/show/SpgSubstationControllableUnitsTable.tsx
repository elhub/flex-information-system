import { Button } from "../../components/ui";
import { Column, SimpleTable } from "../../components/SimpleTable";
import { formatScaled, KILO, Scale } from "../../utils/scales";
import { useTranslate } from "ra-core";
import { useTranslateField } from "../../intl/intl";
import { useNavigate } from "react-router-dom";
import { RegulationDirectionIcon } from "../../controllable_unit/RegulationDirectionField";
import { ControllableUnitRegulationDirection } from "../../generated-client/index";
import { SpgControllableUnitRow } from "./useSpgControllableUnits";

type Props = {
  data: SpgControllableUnitRow[];
  powerScale: Scale;
};

export const SpgSubstationControllableUnitsTable = ({
  data,
  powerScale,
}: Props) => {
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

  return (
    <SimpleTable
      columns={controllableUnitColumns}
      data={data}
      className="w-full p-0"
    />
  );
};

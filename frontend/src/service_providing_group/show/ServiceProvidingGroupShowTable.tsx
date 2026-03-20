import { BodyText, Loader } from "../../components/ui";
import { Column, SimpleTable } from "../../components/SimpleTable";
import {
  useSpgShowViewModel,
  type SpgMembershipRow,
} from "./useSpgShowViewModel";
import { useNavigate } from "react-router-dom";
import { useTranslateField } from "../../intl/intl";

type Props = {
  spgId: number;
};

export const ServiceProvidingGroupShowTable = ({ spgId }: Props) => {
  const { data, isLoading } = useSpgShowViewModel(spgId);
  const navigate = useNavigate();
  const t = useTranslateField();

  if (isLoading) {
    return <Loader />;
  }

  if (!data || data.rows.length === 0) {
    return <BodyText>No controllable units in this group yet.</BodyText>;
  }

  const columns: Column<SpgMembershipRow>[] = [
    {
      key: "controllableUnitName",
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
      key: "capacityKw",
      header: t("controllable_unit.maximum_active_power"),
      render: (value) => <div className="text-right">{String(value)}</div>,
    },
    {
      key: "direction",
      header: t("controllable_unit.regulation_direction"),
    },
    { key: "mpid", header: t("controllable_unit.accounting_point_id") },
  ];

  return (
    <SimpleTable
      rowClick={(row) => navigate(`/controllable_unit/${row.id}/show`)}
      size="small"
      data={data?.rows ?? []}
      columns={columns}
      className="w-full"
    />
  );
};

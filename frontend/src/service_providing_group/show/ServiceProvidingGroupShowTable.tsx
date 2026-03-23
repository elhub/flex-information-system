import { BodyText, Button, Loader } from "../../components/ui";
import { Column, SimpleTable } from "../../components/SimpleTable";
import {
  useSpgShowViewModel,
  type SpgMembershipRow,
} from "./useSpgShowViewModel";
import { Link as RouterLink, useNavigate } from "react-router-dom";
import { useTranslateField } from "../../intl/intl";
import { IconUser } from "@elhub/ds-icons";
import { usePermissions } from "ra-core";
import { Permissions } from "../../auth/permissions";

type Props = {
  spgId: number;
};

export const ServiceProvidingGroupShowTable = ({ spgId }: Props) => {
  const { data, isLoading, error } = useSpgShowViewModel(spgId);
  const navigate = useNavigate();
  const t = useTranslateField();
  const { permissions } = usePermissions<Permissions>();
  const canManageMembers = permissions?.allow(
    "service_providing_group_membership",
    "create",
  );

  if (isLoading) {
    return <Loader />;
  }

  if (error) {
    throw error;
  }

  if (!data || data.rows.length === 0) {
    return (
      <div className="flex flex-col items-start gap-2">
        <BodyText>No controllable units in this group yet.</BodyText>
        {canManageMembers ? (
          <Button
            as={RouterLink}
            to={`/service_providing_group/${spgId}/manage-members`}
            variant="invisible"
            icon={IconUser}
          >
            Manage members
          </Button>
        ) : null}
      </div>
    );
  }

  const columns: Column<SpgMembershipRow>[] = [
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
      key: "maximum_active_power",
      header: t("controllable_unit.maximum_active_power"),
      render: (value) => <div className="text-right">{String(value)}</div>,
    },
    {
      key: "regulation_direction",
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

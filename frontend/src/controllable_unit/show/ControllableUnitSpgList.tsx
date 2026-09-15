import { usePermissions, RecordContextProvider, useTranslate } from "ra-core";
import { Link as RouterLink, useNavigate } from "react-router-dom";
import { Button, Loader } from "../../components/ui";
import { Column, SimpleTable } from "../../components/SimpleTable";
import { Permissions } from "../../auth/permissions";
import { spgStatusVariantMap } from "../../service_providing_group/serviceProvidingGroupStatus";
import { useControllableUnitSpgMemberships } from "./useControllableUnitSpgMemberships";
import { toDateString } from "../../util";
import { IconClockReset } from "@elhub/ds-icons";
import { StatusBadgeField } from "../../components/EDS-ra/fields";

type Props = {
  cuId: number;
};

type SpgMembershipRow = {
  id: number;
  spgId: number;
  name: string;
  status: string;
  validFrom: string;
  validTo: string;
};

export const ControllableUnitSpgList = ({ cuId }: Props) => {
  const { data, isLoading, error } = useControllableUnitSpgMemberships(cuId);
  const navigate = useNavigate();
  const translate = useTranslate();
  const { permissions } = usePermissions<Permissions>();

  const canReadHistory = permissions?.allow(
    "service_providing_group_membership_history",
    "read",
  );

  if (isLoading) {
    return <Loader />;
  }

  if (error) {
    throw error;
  }

  const rows: SpgMembershipRow[] = (data ?? []).map((membership) => ({
    id: membership.id,
    spgId: membership.service_providing_group_id,
    name: membership.service_providing_group?.name ?? "-",
    status: membership.service_providing_group?.status ?? "",
    validFrom: toDateString(membership.valid_from),
    validTo: toDateString(membership.valid_to),
  }));

  const columns: Column<SpgMembershipRow>[] = [
    {
      key: "name",
      header: translate("field.service_providing_group.name"),
    },
    {
      key: "status",
      header: translate("field.service_providing_group.status"),
      render: (value, row) => (
        <RecordContextProvider value={row}>
          <StatusBadgeField
            source="status"
            enumKey="service_providing_group.status"
            variantMap={spgStatusVariantMap}
          />
        </RecordContextProvider>
      ),
    },
    {
      key: "validFrom",
      header: translate("field.service_providing_group_membership.valid_from"),
    },
    {
      key: "validTo",
      header: translate("field.service_providing_group_membership.valid_to"),
    },
  ];

  return (
    <div className="flex flex-col gap-4">
      {canReadHistory && (
        <div className="flex justify-end">
          <Button
            as={RouterLink}
            to={`/controllable_unit/${cuId}/membership_history`}
            variant="secondary"
            icon={IconClockReset}
          >
            {translate("text.cu_spg_view_history")}
          </Button>
        </div>
      )}
      <SimpleTable
        rowClick={(row) =>
          navigate(`/service_providing_group/${row.spgId}/show`)
        }
        size="small"
        data={rows}
        columns={columns}
        className="w-full"
        empty={translate("text.cu_spg_empty")}
      />
    </div>
  );
};

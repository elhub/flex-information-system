import { Loader, Button } from "../../components/ui";
import { Column, SimpleTable } from "../../components/SimpleTable";
import {
  SpgGridPrequalificationRow,
  useSpgGridPrequalifications,
} from "./useSpgGridPrequalifications";
import { Link as RouterLink, useNavigate } from "react-router-dom";
import { useTranslateField } from "../../intl/intl";
import { IconPlus } from "@elhub/ds-icons";
import { usePermissions } from "ra-core";
import { Permissions } from "../../auth/permissions";

type Props = {
  spgId: number;
};

export const ServiceProvidingGroupShowGridPrequalificationsTable = ({
  spgId,
}: Props) => {
  const { data, isLoading, error } = useSpgGridPrequalifications(spgId);
  const navigate = useNavigate();
  const t = useTranslateField();
  const { permissions } = usePermissions<Permissions>();
  const canCreate = permissions?.allow(
    "service_providing_group_grid_prequalification",
    "create",
  );

  const columns: Column<SpgGridPrequalificationRow>[] = [
    {
      key: "id",
      header: t("service_providing_group_grid_prequalification.id"),
    },
    {
      key: "impactedSystemOperatorName",
      header: t(
        "service_providing_group_grid_prequalification.impacted_system_operator_id",
      ),
    },
    {
      key: "status",
      header: t("service_providing_group_grid_prequalification.status"),
    },
    {
      key: "prequalifiedAt",
      header: t(
        "service_providing_group_grid_prequalification.prequalified_at",
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
    <div className="flex flex-col gap-4">
      <div className="flex justify-end">
        {canCreate && (
          <Button
            as={RouterLink}
            to={`/service_providing_group/${spgId}/grid_prequalification/create`}
            state={{ service_providing_group_id: spgId }}
            variant="primary"
            icon={IconPlus}
          >
            Create grid prequalification
          </Button>
        )}
      </div>
      <SimpleTable
        size="small"
        rowClick={(row) =>
          navigate(
            `/service_providing_group/${spgId}/grid_prequalification/${row.id}/show`,
          )
        }
        data={data ?? []}
        columns={columns}
        className="w-full"
      />
    </div>
  );
};

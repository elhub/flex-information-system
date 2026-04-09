import { Loader, Button } from "../../components/ui";
import { Column, SimpleTable } from "../../components/SimpleTable";
import {
  SpgProductApplicationRow,
  useSpgProductApplications,
} from "./useSpgProductApplications";
import { Link as RouterLink, useNavigate } from "react-router-dom";
import { useTranslateField } from "../../intl/intl";
import { IconPlus } from "@elhub/ds-icons";
import { usePermissions } from "ra-core";
import { Permissions } from "../../auth/permissions";

type Props = {
  spgId: number;
};

export const ServiceProvidingGroupShowProductApplicationsTable = ({
  spgId,
}: Props) => {
  const { data, isLoading, error } = useSpgProductApplications(spgId);
  const navigate = useNavigate();
  const t = useTranslateField();
  const { permissions } = usePermissions<Permissions>();
  const canCreate = permissions?.allow(
    "service_providing_group_product_application",
    "create",
  );

  const columns: Column<SpgProductApplicationRow>[] = [
    {
      key: "id",
      header: t("service_providing_group_product_application.id"),
    },
    {
      key: "procuringSystemOperatorName",
      header: t(
        "service_providing_group_product_application.procuring_system_operator_id",
      ),
    },
    {
      key: "productTypeIds",
      header: t("service_providing_group_product_application.product_type_ids"),
      render: (value) => String(value),
    },
    {
      key: "status",
      header: t("service_providing_group_product_application.status"),
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
            to={`/service_providing_group/${spgId}/product_application/create`}
            state={{ service_providing_group_id: spgId }}
            variant="primary"
            icon={IconPlus}
          >
            Create product application
          </Button>
        )}
      </div>
      <SimpleTable
        rowClick={(row) =>
          navigate(
            `/service_providing_group/${spgId}/product_application/${row.id}/show`,
          )
        }
        size="small"
        data={data ?? []}
        columns={columns}
        className="w-full"
      />
    </div>
  );
};

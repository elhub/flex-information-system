import { Loader, Button, Tooltip } from "../../components/ui";
import { SpgpaStatusBadge } from "../../components/SpgpaStatusBadge";
import { Column, SimpleTable } from "../../components/SimpleTable";
import {
  SpgProductApplicationRow,
  useSpgProductApplications,
} from "./useSpgProductApplications";
import { Link as RouterLink, useNavigate } from "react-router-dom";
import { useTranslateField } from "../../intl/intl";
import { IconPlus, IconQuestionCircleOutlined } from "@elhub/ds-icons";
import { usePermissions } from "ra-core";
import { Permissions } from "../../auth/permissions";
import {
  isProductApplicationBlocked,
  getProductApplicationBlockDate,
} from "../../productApplicationBlock";
import { ProductTypeArrayField } from "../../components/ProductTypeArrayField";
import { ServiceProvidingGroupStatus } from "../../generated-client";
import { formatScaled, KILO, Scale } from "../../utils/scales";

type Props = {
  spgId: number;
  spgStatus: ServiceProvidingGroupStatus;
  powerScale: Scale;
};

export const ServiceProvidingGroupShowProductApplicationsTable = ({
  spgId,
  spgStatus,
  powerScale,
}: Props) => {
  const { data, isLoading, error } = useSpgProductApplications(spgId);
  const navigate = useNavigate();
  const t = useTranslateField();
  const { permissions } = usePermissions<Permissions>();
  const canCreate = permissions?.allow(
    "service_providing_group_product_application",
    "create",
  );

  const formatPower = (value: unknown) =>
    formatScaled(Number(value), "W", KILO, powerScale);

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
      render: (value) => (
        <ProductTypeArrayField productTypeIds={value as number[]} />
      ),
    },
    {
      key: "maximumActivePowerUp",
      header: t(
        "service_providing_group_product_application.maximum_active_power_up",
      ),
      render: formatPower,
    },
    {
      key: "maximumActivePowerDown",
      header: t(
        "service_providing_group_product_application.maximum_active_power_down",
      ),
      render: formatPower,
    },
    {
      key: "status",
      header: t("service_providing_group_product_application.status"),
      render: (value) => <SpgpaStatusBadge status={String(value)} />,
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
        {canCreate &&
          (isProductApplicationBlocked() || spgStatus !== "active" ? (
            <div className="flex items-center gap-1">
              <Button variant="primary" icon={IconPlus} disabled>
                Create product application
              </Button>
              <Tooltip
                content={
                  isProductApplicationBlocked()
                    ? `Product applications cannot be created before ${getProductApplicationBlockDate()}`
                    : "The service providing group must be active to create product application"
                }
              >
                <IconQuestionCircleOutlined
                  size="small"
                  className="text-semantic-text-subtle cursor-help"
                />
              </Tooltip>
            </div>
          ) : (
            <Button
              as={RouterLink}
              to={`/service_providing_group/${spgId}/product_application/create`}
              state={{ service_providing_group_id: spgId }}
              variant="primary"
              icon={IconPlus}
            >
              Create product application
            </Button>
          ))}
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

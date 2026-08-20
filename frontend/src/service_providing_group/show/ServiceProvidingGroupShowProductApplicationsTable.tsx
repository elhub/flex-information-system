import { Loader, Button, Tooltip } from "../../components/ui";
import { SpgpaStatusBadge } from "../../components/SpgpaStatusBadge";
import { Column, SimpleTable } from "../../components/SimpleTable";
import {
  SpgProductApplicationRow,
  useSpgProductApplications,
} from "./useSpgProductApplications";
import { Link as RouterLink, useNavigate } from "react-router-dom";
import { useTranslateField } from "../../intl/intl";
import {
  IconPlus,
  IconQuestionCircleOutlined,
  IconTrash,
} from "@elhub/ds-icons";
import { usePermissions } from "ra-core";
import { Permissions } from "../../auth/permissions";
import {
  isProductApplicationBlocked,
  getProductApplicationBlockDate,
} from "../../productApplicationBlock";
import { ProductTypeArrayField } from "../../components/ProductTypeArrayField";
import {
  ServiceProvidingGroupStatus,
  ServiceProvidingGroupProductApplicationStatus,
} from "../../generated-client";
import { useSpgpaDrafts } from "../../hooks/useSpgpaDrafts";

type Props = {
  spgId: number;
  spgStatus: ServiceProvidingGroupStatus;
};

export const ServiceProvidingGroupShowProductApplicationsTable = ({
  spgId,
  spgStatus,
}: Props) => {
  const { data, isLoading, error } = useSpgProductApplications(spgId);
  const navigate = useNavigate();
  const t = useTranslateField();
  const { permissions } = usePermissions<Permissions>();
  const { drafts, deleteDraft } = useSpgpaDrafts();
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
      render: (value) => (
        <ProductTypeArrayField productTypeIds={value as number[]} />
      ),
    },
    {
      key: "maximumActivePowerUp",
      header: t(
        "service_providing_group_product_application.maximum_active_power_up",
      ),
      render: (value) => `${value} kW`,
    },
    {
      key: "maximumActivePowerDown",
      header: t(
        "service_providing_group_product_application.maximum_active_power_down",
      ),
      render: (value) => `${value} kW`,
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

  const draftRows: (SpgProductApplicationRow & { __draftId?: string })[] =
    drafts
      .filter((d) => d.spgId === spgId)
      .map((d, i) => ({
        // Use a large negative offset per index to guarantee unique numeric IDs
        // across multiple drafts for the same SPG.
        id: -(i + 1) as unknown as number,
        __draftId: d.draftId,
        procuringSystemOperatorName: d.systemOperatorName ?? "",
        productTypeIds: d.values.product_type_ids ?? [],
        maximumActivePowerUp: d.values.maximum_active_power_up ?? 0,
        maximumActivePowerDown: d.values.maximum_active_power_down ?? 0,
        status:
          "draft" as unknown as ServiceProvidingGroupProductApplicationStatus,
      }));

  const tableData = [...draftRows, ...(data ?? [])];

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
        rowKey={(row) =>
          (row as SpgProductApplicationRow & { __draftId?: string })
            .__draftId ?? String(row.id)
        }
        rowActions={(row) => {
          const draftId = (
            row as SpgProductApplicationRow & { __draftId?: string }
          ).__draftId;
          if (draftId === undefined) return null;
          return (
            <Button
              variant="invisible"
              size="small"
              icon={IconTrash}
              aria-label="Delete draft"
              onClick={() => deleteDraft(spgId, draftId)}
            />
          );
        }}
        rowClick={(row) => {
          const draftId = (
            row as SpgProductApplicationRow & { __draftId?: string }
          ).__draftId;
          if (draftId !== undefined) {
            const draft = drafts.find(
              (d) => d.spgId === spgId && d.draftId === draftId,
            );
            navigate(
              `/service_providing_group/${spgId}/product_application/create`,
              { state: { ...draft?.values, __draftId: draftId } },
            );
          } else {
            navigate(
              `/service_providing_group/${spgId}/product_application/${row.id}/show`,
            );
          }
        }}
        size="small"
        data={tableData}
        columns={columns}
        className="w-full"
      />
    </div>
  );
};

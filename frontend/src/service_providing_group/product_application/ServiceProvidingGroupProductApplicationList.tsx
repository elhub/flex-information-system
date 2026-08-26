import {
  usePermissions,
  useRecordContext,
  ResourceContextProvider,
  useTranslate,
} from "ra-core";
import { FunctionField } from "react-admin";
import { Link } from "react-router-dom";
import { Datagrid, List } from "../../components/EDS-ra/list";
import { TextField } from "../../components/EDS-ra/fields";
import { SpgpaStatusBadge } from "../../components/SpgpaStatusBadge";
import { Button, Tooltip } from "../../components/ui";
import { useTranslateField } from "../../intl/intl";
import {
  IconPlus,
  IconQuestionCircleOutlined,
  IconTrash,
} from "@elhub/ds-icons";
import { Permissions } from "../../auth/permissions";
import { ProductTypeArrayField } from "../../components/ProductTypeArrayField";
import {
  isProductApplicationBlocked,
  getProductApplicationBlockDate,
} from "../../productApplicationBlock";
import { zServiceProvidingGroupProductApplication } from "../../generated-client/zod.gen";
import { getFields } from "../../zod";
import { useSpgpaDrafts } from "../../hooks/useSpgpaDrafts";
import { DRAFT_STATUS } from "./spgpaStatus";

const CreateButton = ({ id }: { id: any }) => (
  <Button
    as={Link}
    icon={IconPlus}
    to={
      id
        ? `/service_providing_group/${id}/product_application/create`
        : "/service_providing_group_product_application/create"
    }
    state={{ service_providing_group_id: id }}
    variant="invisible"
  >
    Create
  </Button>
);

const blockTooltip = `Product applications cannot be created before ${getProductApplicationBlockDate()}`;

const BlockedCreateButton = () => (
  <div className="flex items-center gap-1">
    <Button variant="primary" icon={IconPlus} iconPosition="left" disabled>
      Create
    </Button>
    <Tooltip className="max-w-2xl" content={blockTooltip}>
      <IconQuestionCircleOutlined
        size="small"
        className="text-semantic-text-subtle cursor-help"
      />
    </Tooltip>
  </div>
);

export const ServiceProvidingGroupProductApplicationList = () => {
  const record = useRecordContext();
  const id = record?.id;
  const t = useTranslateField();
  const translate = useTranslate();
  const { permissions, isLoading } = usePermissions<Permissions>();
  const { drafts, deleteDraft } = useSpgpaDrafts();

  if (isLoading) return null;

  const canRead = permissions?.allow(
    "service_providing_group_product_application",
    "read",
  );
  const canCreate = !!permissions?.allow(
    "service_providing_group_product_application",
    "create",
  );

  if (!canRead) return null;

  const blocked = isProductApplicationBlocked();

  const fields = getFields(zServiceProvidingGroupProductApplication.shape);

  const actions = blocked
    ? [<BlockedCreateButton key="create" />]
    : canCreate
      ? [<CreateButton key="create" id={id} />]
      : [];

  const visibleDrafts = id
    ? drafts.filter((d) => d.spgId === Number(id))
    : drafts;

  const prependData = visibleDrafts.map((draft, i) => ({
    id: -(i + 1),
    service_providing_group: {
      name: draft.spgName,
      service_provider: { name: undefined },
      summary: {
        controllable_unit: { maximum_active_power: { sum: undefined } },
        technical_resource: { maximum_active_power: { sum: undefined } },
      },
    },
    procuring_system_operator: { name: draft.systemOperatorName },
    product_type_ids: draft.values.product_type_ids,
    maximum_active_power_up: draft.values.maximum_active_power_up,
    maximum_active_power_down: draft.values.maximum_active_power_down,
    status: DRAFT_STATUS,
    __draftValues: draft.values,
    __draftId: draft.draftId,
    __spgId: draft.spgId,
  }));

  return (
    <ResourceContextProvider value="service_providing_group_product_application">
      <List
        perPage={10}
        actions={actions}
        empty={false}
        filter={
          id
            ? {
                service_providing_group_id: id,
                embed: "procuring_system_operator",
              }
            : {
                embed:
                  "service_providing_group(service_provider,summary),procuring_system_operator",
              }
        }
        sort={{ field: "id", order: "DESC" }}
        disableSyncWithLocation
      >
        <Datagrid
          prependData={prependData}
          rowActions={(r) => {
            const row = r as (typeof prependData)[number];
            if (!row.__draftId) return null;
            return (
              <Button
                variant="invisible"
                size="small"
                icon={IconTrash}
                aria-label={translate("text.spgpa_delete_draft")}
                onClick={() => deleteDraft(row.__spgId, row.__draftId)}
              />
            );
          }}
          rowClick={(r) => {
            if (r.__draftId) {
              const row = r as (typeof prependData)[number];
              const createPath = row.__spgId
                ? `/service_providing_group/${row.__spgId}/product_application/create`
                : "/service_providing_group_product_application/create";
              return {
                to: createPath,
                state: { ...row.__draftValues, __draftId: row.__draftId },
              };
            }
            return `/service_providing_group_product_application/${r.id}/show`;
          }}
        >
          <TextField source={fields.id.source} />
          {!record?.id && (
            <TextField
              source="service_providing_group.name"
              label={t(
                "service_providing_group_product_application.service_providing_group_id",
              )}
              hideLabel={true}
            />
          )}

          {!record?.id && (
            <TextField
              source="service_providing_group.service_provider.name"
              label={t("service_providing_group.service_provider_id")}
              hideLabel={true}
            />
          )}
          <TextField
            source="procuring_system_operator.name"
            label={t(
              "service_providing_group_product_application.procuring_system_operator_id",
            )}
            hideLabel={true}
          />
          <FunctionField
            source={fields.product_type_ids.source}
            render={(record) => (
              <ProductTypeArrayField productTypeIds={record.product_type_ids} />
            )}
          />
          <TextField
            source={fields.maximum_active_power_up.source}
            unit="kW"
            label={t(
              "service_providing_group_product_application.maximum_active_power_up",
            )}
            hideLabel={true}
          />
          <TextField
            source={fields.maximum_active_power_down.source}
            unit="kW"
            label={t(
              "service_providing_group_product_application.maximum_active_power_down",
            )}
            hideLabel={true}
          />
          {!record?.id && (
            <TextField
              source="service_providing_group.summary.controllable_unit.maximum_active_power.sum"
              label={t("controllable_unit.maximum_active_power")}
              hideLabel={true}
              unit="kW"
            />
          )}
          {!record?.id && (
            <TextField
              source="service_providing_group.summary.technical_resource.maximum_active_power.sum"
              label={t("technical_resource.maximum_active_power")}
              hideLabel={true}
              unit="kW"
            />
          )}
          <FunctionField
            label={t("service_providing_group_product_application.status")}
            render={(r: { status: string }) => (
              <SpgpaStatusBadge status={r.status} />
            )}
          />
        </Datagrid>
      </List>
    </ResourceContextProvider>
  );
};

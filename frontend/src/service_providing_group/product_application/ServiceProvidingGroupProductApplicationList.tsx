import {
  usePermissions,
  useRecordContext,
  ResourceContextProvider,
} from "ra-core";
import { FunctionField } from "react-admin";
import { Link } from "react-router-dom";
import { Datagrid, List } from "../../components/EDS-ra/list";
import { TextField, DateField } from "../../components/EDS-ra/fields";
import { SpgpaStatusBadge } from "../../components/SpgpaStatusBadge";
import { Button, Tooltip } from "../../components/ui";
import { useTranslateField } from "../../intl/intl";
import { IconPlus, IconQuestionCircleOutlined } from "@elhub/ds-icons";
import { Permissions } from "../../auth/permissions";
import { ProductTypeArrayField } from "../../components/ProductTypeArrayField";
import {
  isProductApplicationBlocked,
  getProductApplicationBlockDate,
} from "../../productApplicationBlock";
import { zServiceProvidingGroupProductApplication } from "../../generated-client/zod.gen";
import { getFields } from "../../zod";

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
  const { permissions, isLoading } = usePermissions<Permissions>();

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
                  "service_providing_group(service_provider),procuring_system_operator",
              }
        }
        sort={{ field: "id", order: "DESC" }}
        disableSyncWithLocation
      >
        <Datagrid
          rowClick={(r) =>
            `/service_providing_group_product_application/${r.id}/show`
          }
        >
          <TextField source={fields.id.source} />
          {!record?.id && <TextField source="service_providing_group.name" />}
          {!record?.id && (
            <TextField source="service_providing_group.service_provider.name" />
          )}
          <TextField source="procuring_system_operator.name" />
          <FunctionField
            source={fields.product_type_ids.source}
            render={(record) => (
              <ProductTypeArrayField productTypeIds={record.product_type_ids} />
            )}
          />
          <FunctionField
            label={t("service_providing_group_product_application.status")}
            render={(record: { status: string }) => (
              <SpgpaStatusBadge status={record.status} />
            )}
          />
          <DateField source={fields.recorded_at.source} showTime />
        </Datagrid>
      </List>
    </ResourceContextProvider>
  );
};

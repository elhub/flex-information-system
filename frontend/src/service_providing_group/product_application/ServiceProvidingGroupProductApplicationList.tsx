import {
  List,
  Button,
  ReferenceField,
  ResourceContextProvider,
  TextField,
  TopToolbar,
  usePermissions,
  useRecordContext,
} from "react-admin";
import { Datagrid } from "../../auth";
import AddIcon from "@mui/icons-material/Add";
import { Link } from "react-router-dom";
import { ProductTypeArrayField } from "../../product_type/components";
import { Permissions } from "../../auth/permissions";
import { EnumField } from "../../components/enum";
import {
  isProductApplicationBlocked,
  getProductApplicationBlockDate,
} from "../../productApplicationBlock";
import { Button as EdsButton, Tooltip } from "../../components/ui";
import { IconPlus, IconQuestionCircleOutlined } from "@elhub/ds-icons";

const CreateButton = ({ id }: { id: any }) => (
  <Button
    component={Link}
    to={
      id
        ? `/service_providing_group/${id}/product_application/create`
        : "/service_providing_group_product_application/create"
    }
    startIcon={<AddIcon />}
    state={{ service_providing_group_id: id }}
    label="Create"
  />
);

const blockTooltip = `Product applications cannot be created before ${getProductApplicationBlockDate()}`;

const BlockedCreateButton = () => (
  <div className="flex items-center gap-1">
    <EdsButton
      variant="primary"
      icon={IconPlus}
      iconPosition="left"
      disabled
    >
      Create
    </EdsButton>
    <Tooltip className="max-w-2xl" content={blockTooltip}>
      <IconQuestionCircleOutlined size="small" className="text-semantic-text-subtle cursor-help" />
    </Tooltip>
  </div>
);

type ListActionsProps = { canCreate: boolean; isBlocked: boolean; id: any };

const ListActions = ({ canCreate, isBlocked, id }: ListActionsProps) => (
  <TopToolbar>
    {isBlocked ? <BlockedCreateButton /> : canCreate && <CreateButton id={id} />}
  </TopToolbar>
);

export const ServiceProvidingGroupProductApplicationList = () => {
  const record = useRecordContext();
  const id = record?.id;

  const { permissions, isLoading } = usePermissions<Permissions>();

  if (isLoading) return null; // or a loading spinner

  // Permission checks
  const canRead = permissions?.allow(
    "service_providing_group_product_application",
    "read",
  );
  const canCreate =
    !!permissions?.allow(
      "service_providing_group_product_application",
      "create",
    ) && !isProductApplicationBlocked();

  if (!canRead) {
    return null; // or <NotAllowed /> component
  }

  const blocked = isProductApplicationBlocked();

  return (
    <ResourceContextProvider value="service_providing_group_product_application">
      <List
        title={false}
        perPage={10}
        actions={<ListActions canCreate={canCreate} isBlocked={blocked} id={id} />}
        exporter={false}
        empty={false}
        filter={id ? { service_providing_group_id: id } : undefined}
        sort={{ field: "id", order: "DESC" }}
        sx={{ mb: 4 }}
        disableSyncWithLocation
      >
        <Datagrid
          bulkActionButtons={false}
          rowClick={(_id, _res, record) =>
            `/service_providing_group_product_application/${record.id}/show`
          }
        >
          <TextField
            source="id"
            label="field.service_providing_group_product_application.id"
          />
          {!record?.id && (
            <ReferenceField
              source="service_providing_group_id"
              reference="service_providing_group"
              sortable={false}
              label="field.service_providing_group_product_application.service_providing_group_id"
            >
              <TextField source="name" />
            </ReferenceField>
          )}
          <ReferenceField
            source="procuring_system_operator_id"
            reference="party"
            sortable={false}
            label="field.service_providing_group_product_application.procuring_system_operator_id"
          >
            <TextField source="name" />
          </ReferenceField>
          <ProductTypeArrayField
            label="field.service_providing_group_product_application.product_type_ids"
            source="product_type_ids"
            sortable={false}
          />
          <EnumField
            source="status"
            enumKey="service_providing_group_product_application.status"
            label="field.service_providing_group_product_application.status"
          />
        </Datagrid>
      </List>
    </ResourceContextProvider>
  );
};

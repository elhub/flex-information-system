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

const ListActions = ({ canCreate, id }: { canCreate: boolean; id: any }) => (
  <TopToolbar>{canCreate && <CreateButton id={id} />}</TopToolbar>
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
  const canCreate = !!permissions?.allow(
    "service_providing_group_product_application",
    "create",
  );

  if (!canRead) {
    return null; // or <NotAllowed /> component
  }

  return (
    <ResourceContextProvider value="service_providing_group_product_application">
      <List
        title={false}
        perPage={10}
        actions={<ListActions canCreate={canCreate} id={id} />}
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
            `/service_providing_group/${record.service_providing_group_id}/product_application/${record.id}/show`
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

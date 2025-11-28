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
import { permissionRefs } from "../../auth/permissions";

export const ServiceProvidingGroupProductApplicationList = () => {
  const record = useRecordContext();
  const id = record?.id;

  const { permissions, isLoading } = usePermissions();

  if (isLoading) return null; // or a loading spinner

  // Permission checks
  const canRead = permissions.includes(
    permissionRefs.service_providing_group_product_application.read,
  );
  const canCreate = permissions.includes(
    permissionRefs.service_providing_group_product_application.create,
  );

  if (!canRead) {
    return null; // or <NotAllowed /> component
  }

  const CreateButton = () => (
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

  const ListActions = () => {
    return <TopToolbar>{canCreate && <CreateButton />}</TopToolbar>;
  };

  return (
    <ResourceContextProvider value="service_providing_group_product_application">
      <List
        title={false}
        perPage={10}
        actions={<ListActions />}
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
          <TextField source="id" label="ID" />
          {!record?.id && (
            <ReferenceField
              source="service_providing_group_id"
              reference="service_providing_group"
              sortable={false}
            >
              <TextField source="name" />
            </ReferenceField>
          )}
          <ReferenceField
            source="procuring_system_operator_id"
            reference="party"
            sortable={false}
          >
            <TextField source="name" />
          </ReferenceField>
          <ProductTypeArrayField
            label="Product types"
            source="product_type_ids"
            sortable={false}
          />
          <TextField source="status" />
        </Datagrid>
      </List>
    </ResourceContextProvider>
  );
};

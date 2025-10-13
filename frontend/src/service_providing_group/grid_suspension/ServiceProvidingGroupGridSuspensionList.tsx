import {
  List,
  Button,
  DeleteButton,
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

export const ServiceProvidingGroupGridSuspensionList = () => {
  // id of the SPG (present only when this page is a subresource of SPG)
  const record = useRecordContext();
  const id = record?.id;
  const { permissions } = usePermissions();

  const CreateButton = () => (
    <Button
      component={Link}
      to={
        id
          ? `/service_providing_group/${id}/grid_suspension/create`
          : "/service_providing_group_grid_suspension/create"
      }
      startIcon={<AddIcon />}
      state={{ service_providing_group_id: id }}
      label="Create"
    />
  );

  const ListActions = () => (
    <TopToolbar>
      {permissions.includes(
        "service_providing_group_grid_suspension.create",
      ) && <CreateButton />}
    </TopToolbar>
  );

  return (
    permissions.includes("service_providing_group_grid_suspension.read") && (
      <ResourceContextProvider value="service_providing_group_grid_suspension">
        <List
          title={false}
          perPage={10}
          actions={<ListActions />}
          exporter={false}
          empty={false}
          filter={id ? { service_providing_group_id: id } : undefined}
          sort={{ field: "id", order: "DESC" }}
          // disable read/writes to/from the URL by this component
          // (necessary on pages with several List components,
          // i.e., in our case, subresources)
          // see https://github.com/marmelab/react-admin/pull/5741
          disableSyncWithLocation
        >
          <Datagrid
            bulkActionButtons={false}
            rowClick={(_id, _res, record) =>
              `/service_providing_group/${record.service_providing_group_id}/grid_suspension/${record.id}/show`
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
            {permissions.includes(
              "service_providing_group_grid_suspension.delete",
            ) && <DeleteButton mutationMode="pessimistic" redirect="" />}
          </Datagrid>
        </List>
      </ResourceContextProvider>
    )
  );
};

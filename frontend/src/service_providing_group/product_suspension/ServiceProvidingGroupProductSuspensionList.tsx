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

const CreateButton = ({ id }: { id: any }) => (
  <Button
    component={Link}
    to={
      id
        ? `/service_providing_group/${id}/product_suspension/create`
        : "/service_providing_group_product_suspension/create"
    }
    startIcon={<AddIcon />}
    state={{ service_providing_group_id: id }}
    label="Create"
  />
);

const ListActions = ({
  permissions,
  id,
}: {
  permissions: string[];
  id: any;
}) => (
  <TopToolbar>
    {permissions.includes(
      "service_providing_group_product_suspension.create",
    ) && <CreateButton id={id} />}
  </TopToolbar>
);

export const ServiceProvidingGroupProductSuspensionList = () => {
  const record = useRecordContext();
  const id = record?.id;
  const { permissions } = usePermissions();

  return (
    permissions.includes("service_providing_group_product_suspension.read") && (
      <ResourceContextProvider value="service_providing_group_product_suspension">
        <List
          title={false}
          perPage={10}
          actions={<ListActions permissions={permissions} id={id} />}
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
              `/service_providing_group/${record.service_providing_group_id}/product_suspension/${record.id}/show`
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
            <ProductTypeArrayField label="Product types" />
            <TextField source="reason" />
            {permissions.includes(
              "service_providing_group_product_suspension.delete",
            ) && <DeleteButton mutationMode="pessimistic" redirect="" />}
          </Datagrid>
        </List>
      </ResourceContextProvider>
    )
  );
};

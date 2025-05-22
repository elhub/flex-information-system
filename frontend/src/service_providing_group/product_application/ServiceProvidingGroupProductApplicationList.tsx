import {
  List,
  Button,
  DeleteButton,
  ReferenceField,
  ResourceContextProvider,
  TextField,
  TopToolbar,
  useGetList,
  usePermissions,
  useRecordContext,
} from "react-admin";
import { Datagrid } from "../../auth";
import AddIcon from "@mui/icons-material/Add";
import { Link } from "react-router-dom";
import { ProductTypeField } from "../../product_type/components";

export const ServiceProvidingGroupProductApplicationList = () => {
  // id of the SPG (present only when this page is a subresource of SPG)
  const record = useRecordContext();
  const id = record?.id;
  const { permissions } = usePermissions();

  const { data, isLoading } = useGetList(
    "service_providing_group_product_application",
    { filter: id ? { service_providing_group_id: id } : undefined },
  );

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

  const ListActions = () => (
    <TopToolbar>
      {permissions.includes(
        "service_providing_group_product_application.create",
      ) && <CreateButton />}
    </TopToolbar>
  );

  return (
    permissions.includes(
      "service_providing_group_product_application.read",
    ) && (
      <ResourceContextProvider value="service_providing_group_product_application">
        <List
          title={false}
          perPage={10}
          actions={<ListActions />}
          exporter={false}
          empty={false}
        >
          <Datagrid
            bulkActionButtons={false}
            data={data}
            isLoading={isLoading}
            rowClick={(_id, _res, record) =>
              `/service_providing_group/${record.service_providing_group_id}/product_application/${record.id}/show`
            }
          >
            <TextField source="id" label="ID" />
            {!record?.id && (
              <ReferenceField
                source="service_providing_group_id"
                reference="service_providing_group"
              >
                <TextField source="name" />
              </ReferenceField>
            )}
            <ReferenceField
              source="procuring_system_operator_id"
              reference="party"
            >
              <TextField source="name" />
            </ReferenceField>
            <ProductTypeField source="product_type_id" />
            <TextField source="status" />
            {permissions.includes(
              "service_providing_group_product_application.delete",
            ) && <DeleteButton mutationMode="pessimistic" redirect="" />}
          </Datagrid>
        </List>
      </ResourceContextProvider>
    )
  );
};

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
import { DateField } from "../../DateField";

export const ServiceProvidingGroupGridPrequalificationList = () => {
  // id of the SPG (present only when this page is a subresource of SPG)
  const record = useRecordContext()!;
  const id = record?.id;
  const { permissions } = usePermissions();

  const { data, isLoading } = useGetList(
    "service_providing_group_grid_prequalification",
    { filter: id ? { service_providing_group_id: id } : undefined },
  );

  const CreateButton = () => (
    <Button
      component={Link}
      to={
        id
          ? `/service_providing_group/${id}/grid_prequalification/create`
          : "/service_providing_group_grid_prequalification/create"
      }
      startIcon={<AddIcon />}
      state={{ service_providing_group_id: id }}
      label="Create"
    />
  );

  const ListActions = () => (
    <TopToolbar>
      {permissions.includes(
        "service_providing_group_grid_prequalification.create",
      ) && <CreateButton />}
    </TopToolbar>
  );

  return (
    permissions.includes(
      "service_providing_group_grid_prequalification.read",
    ) && (
      <ResourceContextProvider value="service_providing_group_grid_prequalification">
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
              `/service_providing_group/${record.service_providing_group_id}/grid_prequalification/${record.id}/show`
            }
          >
            <TextField source="id" />
            {!record?.id && (
              <ReferenceField
                source="service_providing_group_id"
                reference="service_providing_group"
              >
                <TextField source="name" />
              </ReferenceField>
            )}
            <ReferenceField
              source="impacted_system_operator_id"
              reference="party"
            >
              <TextField source="name" />
            </ReferenceField>
            <TextField source="status" />
            <DateField source="last_prequalified" showTime />
            {permissions.includes(
              "service_providing_group_grid_prequalification.delete",
            ) && <DeleteButton mutationMode="pessimistic" redirect="" />}
          </Datagrid>
        </List>
      </ResourceContextProvider>
    )
  );
};

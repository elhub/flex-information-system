import {
  List,
  Button,
  DeleteButton,
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
import { DateField } from "../../datetime";
import { IdentityField } from "../../IdentityField";

export const ClientList = () => {
  // id of the entity
  const { id } = useRecordContext()!;
  const { permissions } = usePermissions();

  const { data, isLoading } = useGetList("client", {
    filter: { entity_id: id },
  });

  const CreateButton = () => (
    <Button
      component={Link}
      to={`/entity/${id}/client/create`}
      startIcon={<AddIcon />}
      state={{ entity_id: id }}
      label="Create"
    />
  );

  const ListActions = () => (
    <TopToolbar>
      {permissions.includes("client.create") && <CreateButton />}
    </TopToolbar>
  );

  return (
    permissions.includes("client.read") && (
      <ResourceContextProvider value="client">
        <List
          perPage={10}
          actions={<ListActions />}
          exporter={false}
          empty={false}
          title={false}
        >
          <Datagrid
            bulkActionButtons={false}
            data={data}
            isLoading={isLoading}
            rowClick={(_id, _res, record) =>
              `/entity/${record.entity_id}/client/${record.id}/show`
            }
          >
            <TextField source="id" label="ID" />
            <TextField source="client_id" label="Client ID" />
            <DateField source="recorded_at" showTime />
            <IdentityField source="recorded_by" />
            {permissions.includes("client.delete") && (
              <DeleteButton mutationMode="pessimistic" redirect="" />
            )}
          </Datagrid>
        </List>
      </ResourceContextProvider>
    )
  );
};

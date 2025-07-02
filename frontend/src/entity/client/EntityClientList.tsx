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
  SortPayload,
} from "react-admin";
import { Datagrid } from "../../auth";
import AddIcon from "@mui/icons-material/Add";
import { Link } from "react-router-dom";
import { DateField } from "../../components/datetime";
import { IdentityField } from "../../components/IdentityField";
import { useState } from "react";

export const EntityClientList = () => {
  // id of the entity
  const { id } = useRecordContext()!;
  const { permissions } = usePermissions();

  const [sort, setSort] = useState<SortPayload>({ field: "id", order: "DESC" });
  const { data, isLoading } = useGetList("entity_client", {
    filter: { entity_id: id },
    sort,
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
      {permissions.includes("entity_client.create") && <CreateButton />}
    </TopToolbar>
  );

  return (
    permissions.includes("entity_client.read") && (
      <ResourceContextProvider value="entity_client">
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
            sort={sort}
            setSort={setSort}
            isLoading={isLoading}
            rowClick={(_id, _res, record) =>
              `/entity/${record.entity_id}/client/${record.id}/show`
            }
          >
            <TextField source="id" label="ID" />
            <TextField source="client_id" label="Client ID" />
            <TextField source="name" />
            <DateField source="recorded_at" showTime />
            <IdentityField source="recorded_by" />
            {permissions.includes("entity_client.delete") && (
              <DeleteButton mutationMode="pessimistic" redirect="" />
            )}
          </Datagrid>
        </List>
      </ResourceContextProvider>
    )
  );
};

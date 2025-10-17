import {
  List,
  Button,
  DeleteButton,
  ResourceContextProvider,
  TextField,
  TopToolbar,
  usePermissions,
  useRecordContext,
  ReferenceField,
} from "react-admin";
import { Datagrid } from "../../auth";
import AddIcon from "@mui/icons-material/Add";
import { Link } from "react-router-dom";
import { DateField } from "../../components/datetime";
import { IdentityField } from "../../components/IdentityField";
import { ScopesField } from "../../components/scopes";

const CreateButton = ({ id }: { id: any }) => (
  <Button
    component={Link}
    to={`/entity/${id}/client/create`}
    startIcon={<AddIcon />}
    state={{ entity_id: id }}
    label="Create"
  />
);

const ListActions = (permissions: string[], id: any) => (
  <TopToolbar>
    {permissions.includes("entity_client.create") && <CreateButton id={id} />}
  </TopToolbar>
);

const ActionListWrapper = ({
  permissions,
  id,
}: {
  permissions: string[];
  id: any;
}) => {
  return ListActions(permissions, id);
};

export const EntityClientList = () => {
  // id of the entity
  const { id } = useRecordContext()!;
  const { permissions } = usePermissions();

  return (
    permissions.includes("entity_client.read") && (
      <ResourceContextProvider value="entity_client">
        <List
          perPage={10}
          actions={<ActionListWrapper permissions={permissions} id={id} />}
          exporter={false}
          empty={false}
          title={false}
          filter={{ entity_id: id }}
          sort={{ field: "id", order: "DESC" }}
        >
          <Datagrid
            bulkActionButtons={false}
            rowClick={(_id, _res, record) =>
              `/entity/${record.entity_id}/client/${record.id}/show`
            }
          >
            <TextField source="id" label="ID" />
            <TextField source="client_id" label="Client ID" />
            <TextField source="name" />
            <ReferenceField
              source="party_id"
              reference="party"
              sortable={false}
            >
              <TextField source="name" />
            </ReferenceField>
            <ScopesField source="scopes" />
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

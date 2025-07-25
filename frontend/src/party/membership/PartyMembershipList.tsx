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
import { DateField } from "../../components/datetime";
import { IdentityField } from "../../components/IdentityField";

export const PartyMembershipList = () => {
  // id of the SPG
  const { id } = useRecordContext()!;
  const { permissions } = usePermissions();

  const CreateButton = () => (
    <Button
      component={Link}
      to={`/party/${id}/membership/create`}
      startIcon={<AddIcon />}
      state={{ party_id: id }}
      label="Create"
    />
  );

  const ListActions = () => (
    <TopToolbar>
      {permissions.includes("party_membership.create") && <CreateButton />}
    </TopToolbar>
  );

  return (
    permissions.includes("party_membership.read") && (
      <ResourceContextProvider value="party_membership">
        <List
          perPage={10}
          actions={<ListActions />}
          exporter={false}
          empty={false}
          filter={{ party_id: id }}
          sort={{ field: "id", order: "DESC" }}
        >
          <Datagrid
            bulkActionButtons={false}
            rowClick={(_id, _res, record) =>
              `/party/${record.party_id}/membership/${record.id}/show`
            }
          >
            <TextField source="id" label="ID" />
            <ReferenceField
              source="entity_id"
              reference="entity"
              sortable={false}
            >
              <TextField source="name" />
            </ReferenceField>
            <DateField source="recorded_at" showTime />
            <IdentityField source="recorded_by" />
            {permissions.includes("party_membership.delete") && (
              <DeleteButton mutationMode="pessimistic" redirect="" />
            )}
          </Datagrid>
        </List>
      </ResourceContextProvider>
    )
  );
};

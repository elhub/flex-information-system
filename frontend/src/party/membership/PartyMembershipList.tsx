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
import TravelExploreIcon from "@mui/icons-material/TravelExplore";
import { Link } from "react-router-dom";
import { DateField } from "../../components/datetime";
import { IdentityField } from "../../components/IdentityField";
import { ScopesField } from "../../components/scopes";
import { Permissions } from "../../auth/permissions";

const CreateButton = ({ id }: { id: any }) => (
  <Button
    component={Link}
    to={`/party/${id}/membership/create`}
    startIcon={<AddIcon />}
    state={{ party_id: id }}
    label="Create"
  />
);

const CreateViaLookupButton = ({ id }: { id: any }) => (
  <Button
    component={Link}
    to={`/entity/lookup`}
    startIcon={<TravelExploreIcon />}
    state={{ party_id: id }}
    label="Create via Entity Lookup"
  />
);

const ListActions = ({
  permissions,
  id,
}: {
  permissions: Permissions | undefined;
  id: any;
}) => {
  const canCreate = permissions?.allow("party_membership", "create");
  const canLookup = permissions?.allow("entity", "lookup");

  return (
    <TopToolbar>
      {canCreate && <CreateButton id={id} />}
      {canCreate && canLookup && <CreateViaLookupButton id={id} />}
    </TopToolbar>
  );
};

export const PartyMembershipList = () => {
  // id of the SPG
  const { id } = useRecordContext()!;
  const { permissions } = usePermissions<Permissions>();

  // Permission checks
  const canRead = permissions?.allow("party_membership", "read");
  const canDelete = permissions?.allow("party_membership", "delete");

  return (
    canRead && (
      <ResourceContextProvider value="party_membership">
        <List
          perPage={10}
          actions={<ListActions permissions={permissions} id={id} />}
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
            <TextField source="id" label="field.party_membership.id" />
            <ReferenceField
              source="entity_id"
              reference="entity"
              sortable={false}
              label="field.party_membership.entity_id"
            >
              <TextField source="name" />
            </ReferenceField>
            <ScopesField
              source="scopes"
              label="field.party_membership.scopes"
            />
            <DateField
              source="recorded_at"
              showTime
              label="field.party_membership.recorded_at"
            />
            <IdentityField
              source="recorded_by"
              label="field.party_membership.recorded_by"
            />
            {canDelete && (
              <DeleteButton mutationMode="pessimistic" redirect="" />
            )}
          </Datagrid>
        </List>
      </ResourceContextProvider>
    )
  );
};

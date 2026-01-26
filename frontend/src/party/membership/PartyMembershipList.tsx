import {
  Identifier,
  ResourceContextProvider,
  usePermissions,
  useRecordContext,
} from "ra-core";
import { List, Datagrid } from "../../components/EDS-ra/list";
import {
  DeleteButton,
  NestedResourceHistoryButton,
} from "../../components/EDS-ra/buttons";
import { Button } from "../../components/ui";

import { useNavigate } from "react-router-dom";
import {
  DateField,
  IdentityField,
  ReferenceField,
  ScopesField,
  TextField,
} from "../../components/EDS-ra/fields";
import { Permissions } from "../../auth/permissions";
import { IconPlus, IconSearch } from "@elhub/ds-icons";

const CreateButton = ({ id }: { id: Identifier }) => {
  const navigate = useNavigate();
  const state = { party_id: id };
  return (
    <>
      <Button
        onClick={() => navigate(`/party/${id}/membership/create`, { state })}
        variant="invisible"
        icon={IconPlus}
      >
        Create
      </Button>
    </>
  );
};

const CreateViaLookupButton = ({ id }: { id: Identifier }) => {
  const navigate = useNavigate();
  const state = { party_id: id };
  return (
    <>
      <Button
        onClick={() => navigate(`/entity/lookup`, { state })}
        variant="invisible"
        icon={IconSearch}
      >
        Create via Entity Lookup
      </Button>
    </>
  );
};

const ListActions = ({
  permissions,
  id,
}: {
  permissions: Permissions | undefined;
  id: Identifier;
}) => {
  const canCreate = permissions?.allow("party_membership", "create");
  const canLookup = permissions?.allow("entity", "lookup");

  return (
    <>
      {canCreate && <CreateButton id={id} />}
      {canCreate && canLookup && <CreateViaLookupButton id={id} />}
      <NestedResourceHistoryButton child="membership" label="View History" />
    </>
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
          actions={[
            <ListActions key="actions" permissions={permissions} id={id} />,
          ]}
          exporter={false}
          empty={false}
          filter={{ party_id: id }}
          sort={{ field: "id", order: "DESC" }}
        >
          <Datagrid
            rowClick={(record) =>
              `/party/${record.party_id}/membership/${record.id}/show`
            }
          >
            <TextField source="id" />
            <ReferenceField source="entity_id" reference="entity">
              <TextField source="name" />
            </ReferenceField>
            <ScopesField source="scopes" />
            <DateField source="recorded_at" showTime />
            <IdentityField source="recorded_by" />
            {canDelete && <DeleteButton />}
          </Datagrid>
        </List>
      </ResourceContextProvider>
    )
  );
};

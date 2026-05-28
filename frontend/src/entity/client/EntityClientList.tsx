import { usePermissions, useRecordContext, ResourceContextProvider } from "ra-core";
import { Link as RouterLink } from "react-router-dom";
import { Permissions } from "../../auth/permissions";
import { List, Datagrid } from "../../components/EDS-ra/list";
import {
  DateField,
  IdentityField,
  ReferenceField,
  ScopesField,
  TextField,
} from "../../components/EDS-ra/fields";
import { DeleteButton } from "../../components/EDS-ra/buttons";
import { Button } from "../../components/ui";
import { IconPlus } from "@elhub/ds-icons";

const CreateEntityClientButton = ({ entityId }: { entityId: any }) => (
  <Button
    as={RouterLink}
    to={`/entity/${entityId}/client/create`}
    state={{ entity_id: entityId }}
    variant="primary"
    icon={IconPlus}
  >
    Create
  </Button>
);

export const EntityClientList = () => {
  const { id } = useRecordContext()!;
  const { permissions } = usePermissions<Permissions>();
  const canRead = permissions?.allow("entity_client", "read");
  const canCreate = permissions?.allow("entity_client", "create");
  const canDelete = permissions?.allow("entity_client", "delete");

  return (
    canRead && (
      <ResourceContextProvider value="entity_client">
        <List
          perPage={10}
          empty={false}
          filter={{ entity_id: id }}
          sort={{ field: "id", order: "DESC" }}
          disableSyncWithLocation
          actions={
            canCreate
              ? [<CreateEntityClientButton key="create" entityId={id} />]
              : []
          }
        >
          <Datagrid
            rowClick={(record) =>
              `/entity/${record.entity_id}/client/${record.id}/show`
            }
          >
            <TextField source="id" label="field.entity_client.id" />
            <TextField
              source="client_id"
              label="field.entity_client.client_id"
            />
            <TextField source="name" label="field.entity_client.name" />
            <ReferenceField
              source="party_id"
              reference="party"
              label="field.entity_client.party_id"
            >
              <TextField source="name" />
            </ReferenceField>
            <ScopesField
              source="scopes"
              label="field.entity_client.scopes"
            />
            <DateField
              source="recorded_at"
              showTime
              label="field.entity_client.recorded_at"
            />
            <IdentityField
              source="recorded_by"
              label="field.entity_client.recorded_by"
            />
            {canDelete && <DeleteButton />}
          </Datagrid>
        </List>
      </ResourceContextProvider>
    )
  );
};

import { useRecordContext, usePermissions } from "ra-core";
import { Link } from "react-router-dom";
import { IconPencil } from "@elhub/ds-icons";
import { Button, Content, Heading, VerticalSpace } from "../../components/ui";
import {
  Show,
  TextField,
  ReferenceField,
  DateField,
  IdentityField,
  ScopesField,
} from "../../components/EDS-ra";
import { Permissions } from "../../auth/permissions";

const EditButton = () => {
  const record = useRecordContext();
  if (!record) return null;
  return (
    <Button
      as={Link}
      to={`/entity/${record.entity_id}/client/${record.id}`}
      variant="invisible"
      size="medium"
      icon={IconPencil}
    >
      Edit
    </Button>
  );
};

export const EntityClientShow = () => {
  const { permissions } = usePermissions<Permissions>();
  const canUpdate = permissions?.allow("entity_client", "update");

  return (
    <Show editButton={canUpdate ? <EditButton /> : undefined} historyButton={<></>}>
      <Heading level={2} size="small" spacing>
        Basic information
      </Heading>
      <Content>
        <TextField source="id" label />
        <ReferenceField source="entity_id" reference="entity" label />
        <TextField source="name" label />
        <TextField source="client_id" label />
        <ReferenceField source="party_id" reference="party" label />
        <ScopesField source="scopes" label />
        <TextField source="client_secret" label />
        <TextField source="public_key" label emptyText="--" />
      </Content>
      <VerticalSpace />
      <Heading level={2} size="small" spacing>
        Registration
      </Heading>
      <Content>
        <DateField source="recorded_at" showTime label />
        <IdentityField source="recorded_by" label />
      </Content>
    </Show>
  );
};

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
import { getFields } from "../../zod";
import { zEntityClient } from "../../generated-client/zod.gen";

const fields = getFields(zEntityClient.shape);

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
    <Show
      editButton={canUpdate ? <EditButton /> : undefined}
      historyButton={null}
    >
      <Heading level={2} size="small" spacing>
        Basic information
      </Heading>
      <Content>
        <TextField source={fields.id.source} label />
        <ReferenceField
          source={fields.entity_id.source}
          reference="entity"
          label
        />
        <TextField source={fields.name.source} label />
        <TextField source={fields.client_id.source} label />
        <ReferenceField
          source={fields.party_id.source}
          reference="party"
          label
        />
        <ScopesField source={fields.scopes.source} label />
        <TextField source={fields.client_secret.source} label />
        <TextField source={fields.public_key.source} label emptyText="--" />
      </Content>
      <VerticalSpace />
      <Heading level={2} size="small" spacing>
        Registration
      </Heading>
      <Content>
        <DateField source={fields.recorded_at.source} showTime label />
        <IdentityField source={fields.recorded_by.source} label />
      </Content>
    </Show>
  );
};

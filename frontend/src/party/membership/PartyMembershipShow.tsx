import { useRecordContext, useResourceContext, usePermissions } from "ra-core";
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
  NestedResourceHistoryButton,
} from "../../components/EDS-ra";
import { EventButton } from "../../event/EventButton";
import { Permissions } from "../../auth/permissions";
import { getFields } from "../../zod";
import { zPartyMembershipHistory } from "../../generated-client/zod.gen";

const fields = getFields(zPartyMembershipHistory.shape);

const EditButton = () => {
  const record = useRecordContext();
  if (!record) return null;
  return (
    <Button
      as={Link}
      to={`/party/${record.party_id}/membership/${record.id}`}
      variant="invisible"
      size="medium"
      icon={IconPencil}
    >
      Edit
    </Button>
  );
};

export const PartyMembershipShow = () => {
  const resource = useResourceContext();
  const { permissions } = usePermissions<Permissions>();
  const isHistory = resource?.endsWith("_history");
  const canUpdate = permissions?.allow("party_membership", "update");

  return (
    <Show
      editButton={canUpdate && !isHistory ? <EditButton /> : undefined}
      historyButton={
        <NestedResourceHistoryButton
          child="membership"
          label="party memberships"
        />
      }
      extraActions={!isHistory ? <EventButton filterOnSubject /> : undefined}
    >
      <Heading level={2} size="small" spacing>
        Basic information
      </Heading>
      <Content>
        <TextField source={fields.id.source} label />
        <TextField source={fields.party_membership_id.source} label />
        <ReferenceField
          source={fields.entity_id.source}
          reference="entity"
          label
        />
        <ReferenceField
          source={fields.party_id.source}
          reference="party"
          label
        />
        <ScopesField source={fields.scopes.source} label />
      </Content>
      <VerticalSpace />
      <Heading level={2} size="small" spacing>
        Registration
      </Heading>
      <Content>
        <DateField source={fields.recorded_at.source} showTime label />
        <IdentityField source={fields.recorded_by.source} label />
        <DateField source={fields.replaced_at.source} showTime label />
        <IdentityField source={fields.replaced_by.source} label />
      </Content>
    </Show>
  );
};

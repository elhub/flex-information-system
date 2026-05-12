import { useResourceContext } from "ra-core";
import { Content, Heading, VerticalSpace } from "../components/ui";
import { PartyMembershipList } from "./membership/PartyMembershipList";
import {
  DateField,
  EnumField,
  IdentityField,
  ReferenceField,
  TextField,
  Show,
} from "../components/EDS-ra";

export const PartyShow = () => {
  const resource = useResourceContext();
  const isHistory = resource?.endsWith("_history");

  return (
    <Show>
      <Heading level={2} size="small" spacing>
        Basic information
      </Heading>
      <Content>
        <TextField source="id" label />
        <TextField source="party_id" label tooltip />
        <TextField source="business_id" label tooltip />
        <EnumField
          source="business_id_type"
          enumKey="party.business_id_type"
          label
        />
        <ReferenceField source="entity_id" reference="entity" label>
          <TextField source="name" />
        </ReferenceField>
        <TextField source="name" label />
        <EnumField source="type" enumKey="party.type" label tooltip />
        <EnumField source="role" enumKey="party.role" label tooltip />
        <EnumField source="status" enumKey="party.status" label tooltip />
      </Content>

      <VerticalSpace />
      <Heading level={2} size="small" spacing>
        Registration
      </Heading>
      <Content>
        <DateField source="recorded_at" showTime label tooltip />
        <IdentityField source="recorded_by" label />
        <DateField source="replaced_at" showTime label tooltip />
        <IdentityField source="replaced_by" label tooltip />
      </Content>
      {!isHistory && (
        <>
          <Heading level={2} size="small" spacing>
            Party memberships
          </Heading>
          <PartyMembershipList />
        </>
      )}
    </Show>
  );
};

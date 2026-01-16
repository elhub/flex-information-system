import { useResourceContext } from "ra-core";
import { Content, Heading, VerticalSpace } from "../components/ui";
import { PartyMembershipList } from "./membership/PartyMembershipList";
import {
  NestedResourceHistoryButton,
  ResourceHistoryButton,
} from "../components/history";
import { EventButton } from "../event/EventButton";
import {
  DateField,
  EnumField,
  IdentityField,
  ReferenceField,
  TextField,
} from "../components/EDS-ra/fields/index";
import { Show, SimpleShowLayout } from "../components/EDS-ra/show";

export const PartyShow = () => {
  const resource = useResourceContext()!;

  const isHistory = resource.endsWith("_history");
  const actions = [
    <ResourceHistoryButton key="history" />,
    <EventButton key="event" />,
  ];

  return (
    <Show>
      <SimpleShowLayout actions={actions}>
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
            <NestedResourceHistoryButton
              child="membership"
              label="party memberships"
            />
            <PartyMembershipList />
          </>
        )}
      </SimpleShowLayout>
    </Show>
  );
};

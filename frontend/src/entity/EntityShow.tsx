import { Show, TextField, EnumField } from "../components/EDS-ra";
import { Heading, VerticalSpace, Content } from "../components/ui";
import { EntityClientList } from "./client/EntityClientList";

export const EntityShow = () => (
  <Show>
    <Heading level={2} size="small" spacing>
      Basic information
    </Heading>
    <Content>
      <TextField source="id" label />
      <TextField source="name" label />
      <EnumField source="type" enumKey="entity.type" label />
      <TextField source="business_id" label />
      <EnumField
        source="business_id_type"
        enumKey="entity.business_id_type"
        label
      />
    </Content>
    <VerticalSpace />
    <Heading level={2} size="small" spacing>
      Clients
    </Heading>
    <EntityClientList />
  </Show>
);

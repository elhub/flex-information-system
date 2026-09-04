import { zEntity } from "../generated-client/zod.gen";
import { Show, TextField, EnumField } from "../components/EDS-ra";
import { Heading, VerticalSpace, Content } from "../components/ui";
import { getFields } from "../zod";
import { EntityClientList } from "./client/EntityClientList";

export const EntityShow = () => {
  const fields = getFields(zEntity.shape);
  return (
    <Show>
      <Heading level={2} size="small" spacing>
        Basic information
      </Heading>
      <Content>
        <TextField source={fields.id.source} label />
        <TextField source={fields.name.source} label />
        <EnumField source={fields.type.source} enumKey="entity.type" label />
        <TextField source={fields.business_id.source} label />
        <EnumField
          source={fields.business_id_type.source}
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
};

import { zProductType } from "../generated-client/zod.gen";
import { Show, TextField } from "../components/EDS-ra";
import { Heading, Content } from "../components/ui";
import { getFields } from "../zod";

export const ProductTypeShow = () => {
  const fields = getFields(zProductType.shape);
  return (
    <Show>
      <Heading level={2} size="small" spacing>
        Basic information
      </Heading>
      <Content>
        <TextField source={fields.id.source} label />
        <TextField source={fields.business_id.source} label />
        <TextField source={fields.name.source} label />
        <TextField source={fields.service.source} label />
        <TextField source={fields.products.source} label />
      </Content>
    </Show>
  );
};

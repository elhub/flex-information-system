import { Show, TextField } from "../components/EDS-ra";
import { Heading, Content } from "../components/ui";

export const ProductTypeShow = () => (
  <Show>
    <Heading level={2} size="small" spacing>
      Basic information
    </Heading>
    <Content>
      <TextField source="id" label />
      <TextField source="business_id" label />
      <TextField source="name" label />
      <TextField source="service" label />
      <TextField source="products" label />
    </Content>
  </Show>
);

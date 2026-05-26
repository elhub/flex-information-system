import { useResourceContext } from "ra-core";
import { Content, Heading, VerticalSpace } from "../components/ui";
import {
  Show,
  TextField,
  ReferenceField,
  DateField,
  IdentityField,
  EnumField,
} from "../components/EDS-ra";
import { EventButton } from "../event/EventButton";
import { ProductTypeField } from "../product_type/components";

export const SystemOperatorProductTypeShow = () => {
  const resource = useResourceContext();
  const isHistory = resource?.endsWith("_history");

  return (
    <Show extraActions={!isHistory ? <EventButton /> : undefined}>
      <Heading level={2} size="small" spacing>
        Basic information
      </Heading>
      <Content>
        <TextField source="id" label />
        <TextField source="system_operator_product_type_id" label />
        <ReferenceField source="system_operator_id" reference="party" label />
        <ProductTypeField source="product_type_id" />
        <EnumField
          source="status"
          enumKey="system_operator_product_type.status"
          label
        />
      </Content>
      <VerticalSpace />
      <Heading level={2} size="small" spacing>
        Registration
      </Heading>
      <Content>
        <DateField source="recorded_at" showTime label />
        <IdentityField source="recorded_by" label />
        <DateField source="replaced_at" showTime label />
        <IdentityField source="replaced_by" label />
      </Content>
    </Show>
  );
};

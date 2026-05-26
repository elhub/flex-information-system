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
import { ProductTypeArrayField } from "../product_type/components";

export const ServiceProviderProductSuspensionShow = () => {
  const resource = useResourceContext();
  const isHistory = resource?.endsWith("_history");

  return (
    <Show extraActions={!isHistory ? <EventButton /> : undefined}>
      <Heading level={2} size="small" spacing>
        Basic information
      </Heading>
      <Content>
        <TextField source="id" label />
        <TextField source="service_provider_product_suspension_id" label />
        <ReferenceField
          source="procuring_system_operator_id"
          reference="party"
          label
        />
        <ReferenceField source="service_provider_id" reference="party" label />
        <ProductTypeArrayField source="product_type_ids" label />
        <EnumField
          source="reason"
          enumKey="service_provider_product_suspension.reason"
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

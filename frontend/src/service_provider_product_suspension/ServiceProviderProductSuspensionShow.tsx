import { Content, Heading, VerticalSpace } from "../components/ui";
import { FunctionField } from "react-admin";
import {
  Show,
  TextField,
  ReferenceField,
  DateField,
  IdentityField,
  EnumField,
} from "../components/EDS-ra";
import { ProductTypeArrayField } from "../components/ProductTypeArrayField";
import { getFields } from "../zod";
import { zServiceProviderProductSuspensionHistory } from "../generated-client/zod.gen";

const fields = getFields(zServiceProviderProductSuspensionHistory.shape);

export const ServiceProviderProductSuspensionShow = () => {
  return (
    <Show>
      <Heading level={2} size="small" spacing>
        Basic information
      </Heading>
      <Content>
        <TextField source={fields.id.source} label />
        <TextField
          source={fields.service_provider_product_suspension_id.source}
          label
        />
        <ReferenceField
          source={fields.procuring_system_operator_id.source}
          reference="party"
          label
        />
        <ReferenceField
          source={fields.service_provider_id.source}
          reference="party"
          label
        />
        <FunctionField
          source={fields.product_type_ids.source}
          label
          render={(record) => (
            <ProductTypeArrayField productTypeIds={record.product_type_ids} />
          )}
        />
        <EnumField
          source={fields.reason.source}
          enumKey="service_provider_product_suspension.reason"
          label
        />
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

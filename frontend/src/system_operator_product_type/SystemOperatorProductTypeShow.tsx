import { Content, Heading, VerticalSpace } from "../components/ui";
import {
  Show,
  TextField,
  ReferenceField,
  DateField,
  IdentityField,
  EnumField,
} from "../components/EDS-ra";
import { ProductTypeField } from "../product_type/components";
import { getFields } from "../zod";
import { zSystemOperatorProductTypeHistory } from "../generated-client/zod.gen";

const fields = getFields(zSystemOperatorProductTypeHistory.shape);

export const SystemOperatorProductTypeShow = () => {
  return (
    <Show>
      <Heading level={2} size="small" spacing>
        Basic information
      </Heading>
      <Content>
        <TextField source={fields.id.source} label />
        <TextField
          source={fields.system_operator_product_type_id.source}
          label
        />
        <ReferenceField
          source={fields.system_operator_id.source}
          reference="party"
          label
        />
        <ProductTypeField source={fields.product_type_id.source} />
        <EnumField
          source={fields.status.source}
          enumKey="system_operator_product_type.status"
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

import {
  ReferenceField,
  Show,
  SimpleShowLayout,
  TextField,
  useResourceContext,
} from "react-admin";
import { FieldStack } from "../auth";
import { Typography, Stack } from "@mui/material";
import {
  NestedResourceHistoryButton,
  ResourceHistoryButton,
} from "../components/history";
import { DateField } from "../components/datetime";
import { EventButton } from "../event/EventButton";
import { IdentityField } from "../components/IdentityField";
import { ProductTypeArrayField } from "../product_type/components";
import { CommentList } from "../components/comments";
import { EnumField } from "../components/enum";

export const ServiceProviderProductSuspensionShow = () => {
  const resource = useResourceContext()!;

  const isHistory = resource.endsWith("_history");

  return (
    <Show>
      <SimpleShowLayout>
        <Stack direction="column" spacing={2}>
          <Typography variant="h6" gutterBottom>
            Basic information
          </Typography>
          <FieldStack direction="row" flexWrap="wrap" spacing={2}>
            <TextField
              source="id"
              label="field.service_provider_product_suspension.id"
            />
            <TextField
              source="service_provider_product_suspension_id"
              label="field.service_provider_product_suspension_history.service_provider_product_suspension_id"
            />
            <ReferenceField
              source="procuring_system_operator_id"
              reference="party"
              label="field.service_provider_product_suspension.procuring_system_operator_id"
            >
              <TextField source="name" />
            </ReferenceField>
            <ReferenceField
              source="service_provider_id"
              reference="party"
              label="field.service_provider_product_suspension.service_provider_id"
            >
              <TextField source="name" />
            </ReferenceField>
            <ProductTypeArrayField
              label="field.service_provider_product_suspension.product_type_ids"
              source="product_type_ids"
            />
            <EnumField
              source="reason"
              enumKey="service_provider_product_suspension.reason"
              label="field.service_provider_product_suspension.reason"
            />
          </FieldStack>

          <Typography variant="h6" gutterBottom>
            Registration
          </Typography>
          <FieldStack direction="row" flexWrap="wrap" spacing={2}>
            <DateField
              source="recorded_at"
              showTime
              label="field.service_provider_product_suspension.recorded_at"
            />
            <IdentityField
              source="recorded_by"
              label="field.service_provider_product_suspension.recorded_by"
            />
            <DateField
              source="replaced_at"
              showTime
              label="field.service_provider_product_suspension_history.replaced_at"
            />
            <IdentityField
              source="replaced_by"
              label="field.service_provider_product_suspension_history.replaced_by"
            />
          </FieldStack>
        </Stack>
        <ResourceHistoryButton />
        {!isHistory && <EventButton />}
        {!isHistory && (
          <>
            <Typography variant="h6" gutterBottom>
              Comments
            </Typography>
            <NestedResourceHistoryButton child="comment" label="comments" />
            <CommentList />
          </>
        )}
      </SimpleShowLayout>
    </Show>
  );
};

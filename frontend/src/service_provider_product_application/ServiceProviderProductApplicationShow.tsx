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
import {
  ServiceProviderProductApplicationAlreadyQualified,
  SPPAForSPButton,
} from "./components";
import { CommentList } from "../components/comments";

export const ServiceProviderProductApplicationShow = () => {
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
              label="field.service_provider_product_application.id"
            />
            <ReferenceField
              source="service_provider_id"
              reference="party"
              label="field.service_provider_product_application.service_provider_id"
            >
              <TextField source="name" />
            </ReferenceField>
            <ReferenceField
              source="system_operator_id"
              reference="party"
              label="field.service_provider_product_application.system_operator_id"
            >
              <TextField source="name" />
            </ReferenceField>
            <ProductTypeArrayField
              label="field.service_provider_product_application.product_type_ids"
              source="product_type_ids"
            />
          </FieldStack>

          <Typography variant="h6" gutterBottom>
            Application process
          </Typography>
          <FieldStack direction="row" flexWrap="wrap" spacing={2}>
            <TextField
              source="status"
              label="field.service_provider_product_application.status"
            />
            <DateField
              source="qualified_at"
              showTime
              label="field.service_provider_product_application.qualified_at"
            />
          </FieldStack>
          <FieldStack direction="row" flexWrap="wrap" spacing={2}>
            <ServiceProviderProductApplicationAlreadyQualified />
          </FieldStack>
          <FieldStack direction="row" flexWrap="wrap" spacing={2}>
            <SPPAForSPButton />
          </FieldStack>

          <Typography variant="h6" gutterBottom>
            Registration
          </Typography>
          <FieldStack direction="row" flexWrap="wrap" spacing={2}>
            <DateField
              source="recorded_at"
              showTime
              label="field.service_provider_product_application.recorded_at"
            />
            <IdentityField
              source="recorded_by"
              label="field.service_provider_product_application.recorded_by"
            />
            <DateField
              source="replaced_at"
              showTime
              label="field.service_provider_product_application.replaced_at"
            />
            <IdentityField
              source="replaced_by"
              label="field.service_provider_product_application.replaced_by"
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

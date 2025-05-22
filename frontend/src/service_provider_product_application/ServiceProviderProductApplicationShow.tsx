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
import { ServiceProviderProductApplicationCommentList } from "./comment/ServiceProviderProductApplicationCommentList";
import { IdentityField } from "../components/IdentityField";
import { ProductTypeArrayField } from "../product_type/components";

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
            <TextField source="id" label="ID" />
            <ReferenceField source="service_provider_id" reference="party">
              <TextField source="name" />
            </ReferenceField>
            <ReferenceField source="system_operator_id" reference="party">
              <TextField source="name" />
            </ReferenceField>
            <ProductTypeArrayField
              label="Product types"
              source="product_type_ids"
            />
          </FieldStack>

          <Typography variant="h6" gutterBottom>
            Application process
          </Typography>
          <FieldStack direction="row" flexWrap="wrap" spacing={2}>
            <TextField source="status" />
            <TextField source="notes" />
            <DateField source="last_qualified" showTime />
          </FieldStack>

          <Typography variant="h6" gutterBottom>
            Registration
          </Typography>
          <FieldStack direction="row" flexWrap="wrap" spacing={2}>
            <DateField source="recorded_at" showTime />
            <IdentityField source="recorded_by" />
            <DateField source="replaced_at" showTime />
            <IdentityField source="replaced_by" />
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
            <ServiceProviderProductApplicationCommentList />
          </>
        )}
      </SimpleShowLayout>
    </Show>
  );
};

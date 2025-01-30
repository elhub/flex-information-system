import {
  ArrayField,
  ReferenceField,
  Show,
  SimpleShowLayout,
  TextField,
  useGetList,
  useResourceContext,
  useTranslateLabel,
  WithListContext,
} from "react-admin";
import { FieldStack } from "../auth";
import { Typography, Stack, Chip } from "@mui/material";
import { NestedResourceHistoryButton, ResourceHistoryButton } from "../history";
import { DateField } from "../datetime";
import { EventButton } from "../event/EventButton";
import { ServiceProviderProductApplicationCommentList } from "./comment/ServiceProviderProductApplicationCommentList";
import { IdentityField } from "../IdentityField";

export const ServiceProviderProductApplicationShow = () => {
  const resource = useResourceContext()!;

  const { data: productTypes } = useGetList("product_type");
  const translateLabel = useTranslateLabel();

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
            <ArrayField source="product_type_ids">
              <WithListContext
                render={({ data }) => (
                  <Stack direction="row" spacing={2}>
                    {data?.map((pt_id) => (
                      <Chip
                        key={pt_id as any}
                        sx={{ marginBottom: 1 }}
                        label={translateLabel({
                          source: productTypes?.find(
                            (productType) => productType.id == pt_id,
                          )?.business_id,
                        })}
                      />
                    ))}
                  </Stack>
                )}
              />
            </ArrayField>
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

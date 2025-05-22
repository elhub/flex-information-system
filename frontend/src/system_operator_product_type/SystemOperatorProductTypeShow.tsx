import {
  FunctionField,
  ReferenceField,
  Show,
  SimpleShowLayout,
  TextField,
  useResourceContext,
  useTranslateLabel,
} from "react-admin";
import { FieldStack } from "../auth";
import { Typography, Stack } from "@mui/material";
import { ResourceHistoryButton } from "../components/history";
import { DateField } from "../components/datetime";
import { EventButton } from "../event/EventButton";
import { IdentityField } from "../components/IdentityField";

export const SystemOperatorProductTypeShow = () => {
  const resource = useResourceContext()!;
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
            <ReferenceField source="system_operator_id" reference="party">
              <TextField source="name" />
            </ReferenceField>
            <ReferenceField source="product_type_id" reference="product_type">
              <FunctionField
                render={(record) =>
                  translateLabel({ source: record.business_id })
                }
              />
            </ReferenceField>
            <TextField source="status" />
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
      </SimpleShowLayout>
    </Show>
  );
};

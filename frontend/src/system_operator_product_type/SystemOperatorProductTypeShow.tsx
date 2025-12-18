import {
  ReferenceField,
  Show,
  SimpleShowLayout,
  TextField,
  useResourceContext,
} from "react-admin";
import { FieldStack } from "../auth";
import { Typography, Stack } from "@mui/material";
import { ResourceHistoryButton } from "../components/history";
import { DateField } from "../components/datetime";
import { EventButton } from "../event/EventButton";
import { IdentityField } from "../components/IdentityField";
import { EnumField } from "../components/enum";

export const SystemOperatorProductTypeShow = () => {
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
              label="field.system_operator_product_type.id"
            />
            <TextField
              source="system_operator_product_type_id"
              label="field.system_operator_product_type_history.system_operator_product_type_id"
            />
            <ReferenceField
              source="system_operator_id"
              reference="party"
              label="field.system_operator_product_type.system_operator_id"
            >
              <TextField source="name" />
            </ReferenceField>
            <ReferenceField
              reference="product_type"
              source="product_type_id"
              label="field.system_operator_product_type.product_type_id"
            />
            <EnumField
              source="status"
              enumKey="system_operator_product_type.status"
              label="field.system_operator_product_type.status"
            />
          </FieldStack>
          <Typography variant="h6" gutterBottom>
            Registration
          </Typography>
          <FieldStack direction="row" flexWrap="wrap" spacing={2}>
            <DateField
              source="recorded_at"
              showTime
              label="field.system_operator_product_type.recorded_at"
            />
            <IdentityField
              source="recorded_by"
              label="field.system_operator_product_type.recorded_by"
            />
            <DateField
              source="replaced_at"
              showTime
              label="field.system_operator_product_type_history.replaced_at"
            />
            <IdentityField
              source="replaced_by"
              label="field.system_operator_product_type_history.replaced_by"
            />
          </FieldStack>
        </Stack>
        <ResourceHistoryButton />
        {!isHistory && <EventButton />}
      </SimpleShowLayout>
    </Show>
  );
};

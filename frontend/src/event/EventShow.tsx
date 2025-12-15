import { FunctionField, Show, SimpleShowLayout, TextField } from "react-admin";
import { Typography, Stack } from "@mui/material";
import { FieldStack } from "../auth";
import { DateField } from "../components/datetime";

export const EventShow = () => (
  <Show>
    <SimpleShowLayout>
      <Stack direction="column" spacing={2}>
        <Typography variant="h6" gutterBottom>
          Basic information
        </Typography>
        <FieldStack direction="row" flexWrap="wrap" spacing={2}>
          <TextField source="id" label="field.event.id" />
          <TextField source="type" label="field.event.type" />
          <TextField source="source" label="field.event.source" />
          <TextField source="subject" label="field.event.subject" />
          <FunctionField
            source="data"
            label="field.event.data"
            render={(record) =>
              record.data ? JSON.stringify(record.data) : "{}"
            }
          />
          <DateField source="time" showTime label="field.event.time" />
        </FieldStack>
      </Stack>
    </SimpleShowLayout>
  </Show>
);

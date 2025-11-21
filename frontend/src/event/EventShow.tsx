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
          <TextField source="id" label="ID" />
          <TextField source="type" />
          <TextField source="source" />
          <FunctionField
            source="data"
            render={(record) =>
              record.data ? JSON.stringify(record.data) : "{}"
            }
          />
          <DateField source="time" showTime />
        </FieldStack>
      </Stack>
    </SimpleShowLayout>
  </Show>
);
export default EventShow;

import {
  BooleanField,
  FunctionField,
  ReferenceField,
  Show,
  SimpleShowLayout,
  TextField,
} from "react-admin";
import { Typography, Stack } from "@mui/material";
import { FieldStack } from "../auth";
import { DateField } from "../datetime";
import { AcknowledgeButton } from "./AcknowledgeButton";
import { ResourceButton } from "./ResourceButton";
import { IdentityField } from "../IdentityField";

export const NotificationShow = () => (
  <Show>
    <SimpleShowLayout>
      <Stack direction="column" spacing={2}>
        <Typography variant="h6" gutterBottom>
          Basic information
        </Typography>
        <FieldStack direction="row" flexWrap="wrap" spacing={2}>
          <TextField source="id" label="ID" />
          <BooleanField source="acknowledged" />
          <ReferenceField source="party_id" reference="party">
            <TextField source="name" />
          </ReferenceField>
        </FieldStack>

        <Typography variant="h6" gutterBottom>
          Event
        </Typography>
        <FieldStack direction="column" flexWrap="wrap" spacing={2}>
          <TextField source="event_id" label="Event ID" />
          <ReferenceField
            source="event_id"
            reference="event"
            label="Event type"
          >
            <TextField source="type" />
          </ReferenceField>
          <ReferenceField
            source="event_id"
            reference="event"
            label="Event source"
          >
            <TextField source="source" />
          </ReferenceField>
          <ReferenceField
            source="event_id"
            reference="event"
            label="Event data"
          >
            <FunctionField
              source="data"
              render={(record) =>
                record.data ? JSON.stringify(record.data) : "{}"
              }
            />
          </ReferenceField>
          <ReferenceField
            source="event_id"
            reference="event"
            label="Event time"
          >
            <DateField source="time" showTime />
          </ReferenceField>
        </FieldStack>

        <Typography variant="h6" gutterBottom>
          Registration
        </Typography>
        <FieldStack direction="row" flexWrap="wrap" spacing={2}>
          <DateField source="recorded_at" showTime />
          <IdentityField source="recorded_by" />
        </FieldStack>
      </Stack>
      <ResourceButton />
      <AcknowledgeButton />
    </SimpleShowLayout>
  </Show>
);

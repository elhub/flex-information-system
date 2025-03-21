import {
  BooleanField,
  FunctionField,
  ReferenceField,
  Show,
  SimpleShowLayout,
  TextField,
  useGetOne,
  useRecordContext,
} from "react-admin";
import { Typography, Stack, CircularProgress } from "@mui/material";
import { FieldStack } from "../auth";
import { DateField } from "../datetime";
import { AcknowledgeButton } from "./AcknowledgeButton";
import { ResourceButton } from "../ResourceButton";
import { IdentityField } from "../IdentityField";

export const EventResourceButton = () => {
  const eventRecord = useRecordContext()!;
  const {
    data: event,
    isPending: eventPending,
    error: eventError,
  } = useGetOne("event", { id: eventRecord.event_id });

  if (eventPending) {
    return <CircularProgress size={25} thickness={2} />;
  }

  if (eventError) {
    return null;
  }

  const operation = event?.type.split(".").slice(-1);

  return (
    <ResourceButton source={event?.source} disabled={operation == "delete"} />
  );
};

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
        <FieldStack direction="row" flexWrap="wrap" spacing={2}>
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
      <EventResourceButton />
      <AcknowledgeButton />
    </SimpleShowLayout>
  </Show>
);

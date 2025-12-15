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
import { Typography, Stack, CircularProgress, Alert } from "@mui/material";
import { FieldStack } from "../auth";
import { DateField } from "../components/datetime";
import { AcknowledgeButton } from "./AcknowledgeButton";
import { ResourceButton } from "../components/ResourceButton";
import { IdentityField } from "../components/IdentityField";

export const EventResourceButton = () => {
  const eventRecord = useRecordContext()!;
  const {
    data: event,
    isPending: eventPending,
    error: eventError,
  } = useGetOne(
    "event",
    { id: eventRecord.event_id },
    { retry: 1, refetchOnWindowFocus: false },
  );

  if (eventPending) {
    return <CircularProgress size={25} thickness={2} />;
  }

  if (eventError) {
    return (
      <Alert severity="info">
        The event that is connected to this notification could not be loaded.
        This might be due to a network error or you have lost access to see the
        event.
      </Alert>
    );
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
          <TextField source="id" label="field.notification.id" />
          <BooleanField
            source="acknowledged"
            label="field.notification.acknowledged"
          />
          <ReferenceField
            source="party_id"
            reference="party"
            label="field.notification.party_id"
          >
            <TextField source="name" />
          </ReferenceField>
        </FieldStack>

        <Typography variant="h6" gutterBottom>
          Event
        </Typography>
        <FieldStack direction="row" flexWrap="wrap" spacing={2}>
          <TextField source="event_id" label="field.notification.event_id" />
          <ReferenceField
            source="event_id"
            reference="event"
            label="field.event.type"
          >
            <TextField source="type" />
          </ReferenceField>
          <ReferenceField
            source="event_id"
            reference="event"
            label="field.event.source"
          >
            <TextField source="source" label="field.notification.source" />
          </ReferenceField>
          <ReferenceField
            source="event_id"
            reference="event"
            label="field.event.data"
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
            label="field.event.time"
          >
            <DateField source="time" showTime />
          </ReferenceField>
        </FieldStack>

        <Typography variant="h6" gutterBottom>
          Registration
        </Typography>
        <FieldStack direction="row" flexWrap="wrap" spacing={2}>
          <DateField
            source="recorded_at"
            showTime
            label="field.notification.recorded_at"
          />
          <IdentityField
            source="recorded_by"
            label="field.notification.recorded_by"
          />
        </FieldStack>
      </Stack>
      <EventResourceButton />
      <AcknowledgeButton />
    </SimpleShowLayout>
  </Show>
);

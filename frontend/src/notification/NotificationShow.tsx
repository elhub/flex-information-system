import { useGetOne, useRecordContext } from "ra-core";
import { Alert, BodyText, Content, Heading, Loader, VerticalSpace } from "../components/ui";
import {
  Show,
  TextField,
  ReferenceField,
  DateField,
  IdentityField,
  ResourceButton,
} from "../components/EDS-ra";
import { AcknowledgeButton } from "./AcknowledgeButton";

const JsonDataField = () => {
  const record = useRecordContext();
  const value = record?.data;
  return (
    <BodyText size="small">{value ? JSON.stringify(value) : "{}"}</BodyText>
  );
};

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
    return <Loader size="small" />;
  }

  if (eventError) {
    return (
      <Alert variant="info">
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
    <Heading level={2} size="small" spacing>
      Basic information
    </Heading>
    <Content>
      <TextField source="id" label />
      <TextField source="acknowledged" label />
      <ReferenceField source="party_id" reference="party" label />
    </Content>
    <VerticalSpace />
    <Heading level={2} size="small" spacing>
      Event
    </Heading>
    <Content>
      <TextField source="event_id" label />
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
        <TextField source="source" />
      </ReferenceField>
      <ReferenceField
        source="event_id"
        reference="event"
        label="field.event.data"
      >
        <JsonDataField />
      </ReferenceField>
      <ReferenceField
        source="event_id"
        reference="event"
        label="field.event.time"
      >
        <DateField source="time" showTime />
      </ReferenceField>
    </Content>
    <VerticalSpace />
    <Heading level={2} size="small" spacing>
      Registration
    </Heading>
    <Content>
      <DateField source="recorded_at" showTime label />
      <IdentityField source="recorded_by" label />
    </Content>
    <EventResourceButton />
    <AcknowledgeButton />
  </Show>
);

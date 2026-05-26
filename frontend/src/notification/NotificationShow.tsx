import { useGetOne, useRecordContext } from "ra-core";
import { zNotification } from "../generated-client/zod.gen";
import { Alert, BodyText, Content, Heading, Loader, VerticalSpace } from "../components/ui";
import {
  Show,
  TextField,
  ReferenceField,
  DateField,
  IdentityField,
  ResourceButton,
} from "../components/EDS-ra";
import { getFields } from "../zod";
import { AcknowledgeButton } from "./AcknowledgeButton";

const notificationFields = getFields(zNotification.shape);

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
      <TextField source={notificationFields.id.source} label />
      <TextField source={notificationFields.acknowledged.source} label />
      <ReferenceField source={notificationFields.party_id.source} reference="party" label />
    </Content>
    <VerticalSpace />
    <Heading level={2} size="small" spacing>
      Event
    </Heading>
    <Content>
      <TextField source={notificationFields.event_id.source} label />
      <ReferenceField
        source={notificationFields.event_id.source}
        reference="event"
        label="field.event.type"
      >
        <TextField source="type" />
      </ReferenceField>
      <ReferenceField
        source={notificationFields.event_id.source}
        reference="event"
        label="field.event.source"
      >
        <TextField source="source" />
      </ReferenceField>
      <ReferenceField
        source={notificationFields.event_id.source}
        reference="event"
        label="field.event.data"
      >
        <JsonDataField />
      </ReferenceField>
      <ReferenceField
        source={notificationFields.event_id.source}
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
      <DateField source={notificationFields.recorded_at.source} showTime label />
      <IdentityField source={notificationFields.recorded_by.source} label />
    </Content>
    <EventResourceButton />
    <AcknowledgeButton />
  </Show>
);

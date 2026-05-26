import { useRecordContext } from "ra-core";
import { zEvent } from "../generated-client/zod.gen";
import { Show, TextField, DateField } from "../components/EDS-ra";
import { BaseField } from "../components/EDS-ra/fields/BaseField";
import { BodyText } from "../components/ui";
import { Heading, Content } from "../components/ui";
import { getFields } from "../zod";

const eventFields = getFields(zEvent.shape);

const DataField = () => {
  const record = useRecordContext();
  const value = record?.data;
  return (
    <BaseField source={eventFields.data.source} label>
      <BodyText size="small">
        {value ? JSON.stringify(value) : "{}"}
      </BodyText>
    </BaseField>
  );
};

export const EventShow = () => (
  <Show>
    <Heading level={2} size="small" spacing>
      Basic information
    </Heading>
    <Content>
      <TextField source={eventFields.id.source} label />
      <TextField source={eventFields.type.source} label />
      <TextField source={eventFields.source.source} label />
      <TextField source={eventFields.subject.source} label />
      <DataField />
      <DateField source={eventFields.time.source} showTime label />
    </Content>
  </Show>
);

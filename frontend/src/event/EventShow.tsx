import { useRecordContext } from "ra-core";
import { Show, TextField, DateField } from "../components/EDS-ra";
import { BaseField } from "../components/EDS-ra/fields/BaseField";
import { BodyText } from "../components/ui";
import { Heading, Content } from "../components/ui";

const DataField = () => {
  const record = useRecordContext();
  const value = record?.data;
  return (
    <BaseField source="data" label>
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
      <TextField source="id" label />
      <TextField source="type" label />
      <TextField source="source" label />
      <TextField source="subject" label />
      <DataField />
      <DateField source="time" showTime label />
    </Content>
  </Show>
);

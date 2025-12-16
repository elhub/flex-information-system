import { List, TextField } from "react-admin";
import { Datagrid } from "../auth";
import { DateField } from "../components/datetime";

export const EventList = () => (
  <List perPage={25} sort={{ field: "id", order: "DESC" }} empty={false}>
    <Datagrid>
      <TextField source="id" label="field.event.id" />
      <TextField source="type" label="field.event.type" />
      <TextField source="source" label="field.event.source" />
      <TextField source="subject" label="field.event.subject" />
      <DateField source="time" showTime label="field.event.time" />
    </Datagrid>
  </List>
);

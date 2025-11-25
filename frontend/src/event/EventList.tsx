import { List, TextField } from "react-admin";
import { Datagrid } from "../auth";
import { DateField } from "../components/datetime";

export const EventList = () => (
  <List perPage={25} sort={{ field: "id", order: "DESC" }} empty={false}>
    <Datagrid>
      <TextField source="id" label="ID" />
      <TextField source="type" />
      <TextField source="source" />
      <DateField source="time" showTime />
    </Datagrid>
  </List>
);

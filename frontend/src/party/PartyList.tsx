import { List, ReferenceField, TextField } from "react-admin";
import { Datagrid } from "../auth";
import { DateField } from "../datetime";

export const PartyList = () => (
  <List perPage={25} sort={{ field: "id", order: "DESC" }}>
    <Datagrid>
      <TextField source="id" label="ID" />
      <TextField source="business_id" label="Business ID" />
      <ReferenceField source="entity_id" reference="entity">
        <TextField source="name" />
      </ReferenceField>
      <TextField source="name" />
      <TextField source="type" />
      <TextField source="role" />
      <TextField source="status" />
      <DateField source="recorded_at" showTime />
    </Datagrid>
  </List>
);

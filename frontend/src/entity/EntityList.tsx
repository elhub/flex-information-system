import { List, TextField } from "react-admin";
import { Datagrid } from "../auth";

export const EntityList = () => (
  <List perPage={25} sort={{ field: "id", order: "DESC" }}>
    <Datagrid>
      <TextField source="id" />
      <TextField source="name" />
      <TextField source="type" />
      <TextField source="business_id" label="Business ID" />
      <TextField source="business_id_type" label="Business ID type" />
    </Datagrid>
  </List>
);

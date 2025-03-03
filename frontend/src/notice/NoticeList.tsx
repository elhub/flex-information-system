import { FunctionField, List, ReferenceField, TextField } from "react-admin";
import { Datagrid } from "../auth";

export const NoticeList = () => (
  <List perPage={25} sort={{ field: "id", order: "DESC" }} empty={false}>
    <Datagrid>
      <TextField source="id" label="ID" />
      <ReferenceField source="party_id" reference="party">
        <TextField source="name" />
      </ReferenceField>
      <TextField source="type" />
      <TextField source="source" />
      <FunctionField
        source="data"
        render={(record) => (record.data ? JSON.stringify(record.data) : "{}")}
      />
    </Datagrid>
  </List>
);

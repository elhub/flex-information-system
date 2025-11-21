import { List, TextField, ReferenceField } from "react-admin";
import { Datagrid } from "../auth";
import { useParams } from "react-router-dom";
import { historyRowClick } from "../components/history";
import { DateField } from "../components/datetime";

export const PartyHistoryList = () => {
  const { party_id } = useParams();
  return (
    <List
      resource="party_history"
      filter={{ party_id: party_id }}
      perPage={25}
      sort={{ field: "recorded_at", order: "DESC" }}
      empty={false}
    >
      <Datagrid rowClick={historyRowClick}>
        <TextField source="id" label="ID" />
        <TextField source="party_id" />
        <TextField source="business_id" label="Business ID" />
        <ReferenceField source="entity_id" reference="entity" sortable={false}>
          <TextField source="name" />
        </ReferenceField>
        <TextField source="name" />
        <TextField source="type" />
        <TextField source="role" />
        <TextField source="status" />
        <DateField source="recorded_at" showTime />
        <DateField source="replaced_at" showTime />
      </Datagrid>
    </List>
  );
};
export default PartyHistoryList;

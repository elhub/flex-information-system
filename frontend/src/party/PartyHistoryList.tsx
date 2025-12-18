import { List, TextField, ReferenceField } from "react-admin";
import { Datagrid } from "../auth";
import { useParams } from "react-router-dom";
import { historyRowClick } from "../components/history";
import { DateField } from "../components/datetime";
import { EnumField } from "../components/enum";

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
        <TextField source="id" label="field.party_history.id" />
        <TextField source="party_id" label="field.party_history.party_id" />
        <TextField
          source="business_id"
          label="field.party_history.business_id"
        />
        <ReferenceField
          source="entity_id"
          reference="entity"
          sortable={false}
          label="field.party_history.entity_id"
        >
          <TextField source="name" />
        </ReferenceField>
        <TextField source="name" label="field.party_history.name" />
        <EnumField
          source="type"
          label="field.party_history.type"
          enumKey="party.type"
        />
        <EnumField
          source="role"
          label="field.party_history.role"
          enumKey="party.role"
        />
        <EnumField
          source="status"
          label="field.party_history.status"
          enumKey="party.status"
        />
        <DateField
          source="recorded_at"
          showTime
          label="field.party_history.recorded_at"
        />
        <DateField
          source="replaced_at"
          showTime
          label="field.party_history.replaced_at"
        />
      </Datagrid>
    </List>
  );
};

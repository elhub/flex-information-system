import { useParams } from "react-router-dom";
import { Datagrid, List } from "../components/EDS-ra/list";
import {
  DateField,
  EnumField,
  ReferenceField,
  TextField,
} from "../components/EDS-ra/fields";
import { zParty, zPartyHistory } from "../generated-client/zod.gen";
import { getFields } from "../zod";

export const PartyHistoryList = () => {
  const { party_id } = useParams();

  const fields = getFields(zParty.shape);
  const historyFields = getFields(zPartyHistory.shape);

  return (
    <List
      resource="party_history"
      filter={{ party_id }}
      perPage={25}
      sort={{ field: "recorded_at", order: "DESC" }}
      empty={false}
    >
      <Datagrid rowClick={false}>
        <TextField {...fields.id} />
        <TextField {...historyFields.party_id} />
        <TextField {...fields.business_id} />
        <ReferenceField {...fields.entity_id} reference="entity">
          <TextField source="name" />
        </ReferenceField>
        <TextField {...fields.name} />
        <EnumField {...fields.type} enumKey="party.type" />
        <EnumField {...fields.role} enumKey="party.role" />
        <EnumField {...fields.status} enumKey="party.status" />
        <DateField {...fields.recorded_at} showTime />
        <DateField {...historyFields.replaced_at} showTime />
      </Datagrid>
    </List>
  );
};

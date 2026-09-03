import { useParams } from "react-router-dom";
import { Datagrid } from "../../components/EDS-ra/list/Datagrid";
import { List } from "../../components/EDS-ra/list/List";
import { DateField } from "../../components/EDS-ra/fields/DateField";
import { IdentityField } from "../../components/EDS-ra/fields/IdentityField";
import { ReferenceField } from "../../components/EDS-ra/fields/ReferenceField";
import { ScopesField } from "../../components/EDS-ra/fields/ScopesField";
import { TextField } from "../../components/EDS-ra/fields/TextField";
import { TextInput } from "../../components/EDS-ra/inputs/TextInput";
import {
  zPartyMembership,
  zPartyMembershipHistory,
} from "../../generated-client/zod.gen";
import { getFields } from "../../zod";

export const PartyMembershipHistoryList = () => {
  const { party_id } = useParams();

  const fields = getFields(zPartyMembership.shape);
  const historyFields = getFields(zPartyMembershipHistory.shape);

  return (
    <List
      resource="party_membership_history"
      filter={{ party_id }}
      perPage={25}
      sort={{ field: "recorded_at", order: "DESC" }}
      empty={false}
      filters={[
        <TextInput
          key="party_membership_id"
          type="number"
          {...historyFields.party_membership_id}
        />,
      ]}
    >
      <Datagrid rowClick={false}>
        <TextField {...fields.id} />
        <TextField {...historyFields.party_membership_id} />
        <ReferenceField {...fields.entity_id} reference="entity">
          <TextField source="name" />
        </ReferenceField>
        <ReferenceField {...fields.party_id} reference="party">
          <TextField source="name" />
        </ReferenceField>
        <ScopesField {...fields.scopes} />
        <DateField {...fields.recorded_at} showTime />
        <IdentityField {...fields.recorded_by} />
        <DateField {...historyFields.replaced_at} showTime />
        <IdentityField {...historyFields.replaced_by} />
      </Datagrid>
    </List>
  );
};

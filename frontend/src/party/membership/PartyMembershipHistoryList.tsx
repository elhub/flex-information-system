import { List, NumberInput, ReferenceField, TextField } from "react-admin";
import { Datagrid } from "../../auth";
import { useParams } from "react-router-dom";
import { DateField } from "../../datetime";
import { IdentityField } from "../../IdentityField";

export const PartyMembershipHistoryList = () => {
  const params = useParams();
  var filter: any = {
    party_id: params.party_id,
  };

  const PartyMembershipHistoryListFilters = [
    <NumberInput
      key="party_membership_id"
      min="0"
      label="Party Membership ID"
      source="party_membership_id"
    />,
  ];

  return (
    <List
      resource="party_membership_history"
      filter={filter}
      filters={PartyMembershipHistoryListFilters}
      perPage={25}
      sort={{ field: "recorded_at", order: "DESC" }}
      empty={false}
    >
      <Datagrid
        rowClick={(_id, _res, record) =>
          `/party/${record.party_id}/membership_history/${record.id}/show`
        }
      >
        <TextField source="id" label="ID" />
        <TextField source="party_membership_id" />
        <ReferenceField source="entity_id" reference="entity" link="show">
          <TextField source="name" />
        </ReferenceField>
        <ReferenceField source="party_id" reference="party" link="show">
          <TextField source="name" />
        </ReferenceField>
        <DateField source="recorded_at" showTime />
        <IdentityField source="recorded_by" />
        <DateField source="replaced_at" showTime />
        <IdentityField source="replaced_by" />
      </Datagrid>
    </List>
  );
};

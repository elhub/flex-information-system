import { List, NumberInput, ReferenceField, TextField } from "react-admin";
import { Datagrid } from "../../auth";
import { useParams } from "react-router-dom";
import { DateField } from "../../components/datetime";
import { IdentityField } from "../../components/IdentityField";
import { ScopesField } from "../../components/scopes";

export const PartyMembershipHistoryList = () => {
  const params = useParams();
  const filter: any = {
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
        <TextField source="id" label="field.party_membership_history.id" />
        <TextField
          source="party_membership_id"
          label="field.party_membership_history.party_membership_id"
        />
        <ReferenceField
          source="entity_id"
          reference="entity"
          link="show"
          sortable={false}
          label="field.party_membership_history.entity_id"
        >
          <TextField source="name" />
        </ReferenceField>
        <ReferenceField
          source="party_id"
          reference="party"
          link="show"
          sortable={false}
          label="field.party_membership_history.party_id"
        >
          <TextField source="name" />
        </ReferenceField>
        <ScopesField
          source="scopes"
          label="field.party_membership_history.scopes"
        />
        <DateField
          source="recorded_at"
          showTime
          label="field.party_membership_history.recorded_at"
        />
        <IdentityField
          source="recorded_by"
          label="field.party_membership_history.recorded_by"
        />
        <DateField
          source="replaced_at"
          showTime
          label="field.party_membership_history.replaced_at"
        />
        <IdentityField
          source="replaced_by"
          label="field.party_membership_history.replaced_by"
        />
      </Datagrid>
    </List>
  );
};
